import io
import os
import sys
import time
import queue
import atexit
import shutil
import pathlib
import tempfile
import subprocess

import streamlit as st
import requests


# --- Helpers ---
PROJECT_ROOT = pathlib.Path(__file__).resolve().parent
NODE_SCRIPT = PROJECT_ROOT / "load-yaml-api.js"


def ensure_node_available() -> str:
    # Try common node executable names/paths
    candidates = [
        shutil.which("node"),
        shutil.which("nodejs"),
        "/usr/bin/node",
        "/usr/local/bin/node",
        "/usr/bin/nodejs",
        "/usr/local/bin/nodejs",
    ]
    for path in candidates:
        if path and os.path.exists(path):
            return path
    raise RuntimeError(
        "Node.js not found in PATH. On Streamlit Cloud, add 'nodejs' and 'npm' to packages.txt."
    )


def ensure_npm_available() -> str:
    candidates = [
        shutil.which("npm"),
        "/usr/bin/npm",
        "/usr/local/bin/npm",
    ]
    for path in candidates:
        if path and os.path.exists(path):
            return path
    raise RuntimeError(
        "npm not found in PATH. On Streamlit Cloud, add 'npm' to packages.txt."
    )


def ensure_node_dependencies_installed(log_path: str) -> None:
    # Simple guard: if axios and express exist in node_modules, assume install ok
    axios_dir = PROJECT_ROOT / "node_modules" / "axios"
    express_dir = PROJECT_ROOT / "node_modules" / "express"
    if axios_dir.exists() and express_dir.exists():
        return

    npm_exec = ensure_npm_available()
    with open(log_path, "a", buffering=1) as log_file:
        log_file.write("\nInstalling Node dependencies with 'npm ci --omit=dev'...\n")
        proc = subprocess.run(
            [npm_exec, "ci", "--omit=dev"],
            cwd=str(PROJECT_ROOT),
            stdout=log_file,
            stderr=subprocess.STDOUT,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            raise RuntimeError("npm ci failed. See Server Logs for details.")


def write_uploaded_file(uploaded) -> str:
    suffix = pathlib.Path(uploaded.name).suffix or ".yaml"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(uploaded.getbuffer())
    tmp.flush()
    tmp.close()
    return tmp.name


def start_server(spec_path: str, port: int, host: str, log_path: str) -> subprocess.Popen:
    if not NODE_SCRIPT.exists():
        raise FileNotFoundError(f"Missing script: {NODE_SCRIPT}")

    node_exec = ensure_node_available()
    ensure_node_dependencies_installed(log_path)

    # Open log file for appending; stream Node output here
    log_file = open(log_path, "a", buffering=1)

    env = os.environ.copy()
    env["PORT"] = str(port)
    env["HOST"] = host

    cmd = [node_exec, str(NODE_SCRIPT), spec_path]

    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        env=env,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    return proc


def stop_server(proc: subprocess.Popen | None):
    if not proc:
        return
    if proc.poll() is None:
        try:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
        except Exception:
            pass


def base_url(host: str, port: int) -> str:
    # If host is 0.0.0.0, use localhost for requests
    host_for_client = "localhost" if host == "0.0.0.0" else host
    return f"http://{host_for_client}:{port}"


def tail_file(path: str, max_bytes: int = 16_000) -> str:
    try:
        size = os.path.getsize(path)
        with open(path, "rb") as f:
            if size > max_bytes:
                f.seek(-max_bytes, os.SEEK_END)
            return f.read().decode(errors="replace")
    except Exception:
        return ""


# --- Streamlit UI ---
st.set_page_config(page_title="OpenAPI Mock Interface", page_icon="🧪", layout="wide")
st.title("OpenAPI Mock Server Controller")

if "server_proc" not in st.session_state:
    st.session_state.server_proc = None
if "spec_path" not in st.session_state:
    st.session_state.spec_path = None
if "log_path" not in st.session_state:
    st.session_state.log_path = os.path.join(tempfile.gettempdir(), "openapi-mock-server.log")


with st.sidebar:
    st.header("Server Settings")
    host = st.text_input("Host", value="0.0.0.0")
    port = st.number_input("Port", value=8000, min_value=1, max_value=65535, step=1)
    st.caption("Use 0.0.0.0 to expose to network; app will call via localhost.")

    st.divider()
    uploaded = st.file_uploader("Upload OpenAPI YAML/JSON", type=["yaml", "yml", "json"])
    if uploaded is not None:
        st.session_state.spec_path = write_uploaded_file(uploaded)
        st.success(f"Uploaded to temporary file: {st.session_state.spec_path}")

    if st.button("Start Server", type="primary", disabled=st.session_state.server_proc is not None):
        if not st.session_state.spec_path:
            st.error("Please upload a YAML/JSON spec first.")
        else:
            try:
                # Clear previous log
                try:
                    os.remove(st.session_state.log_path)
                except FileNotFoundError:
                    pass
                proc = start_server(st.session_state.spec_path, int(port), host, st.session_state.log_path)
                st.session_state.server_proc = proc
                time.sleep(0.3)
                st.success("Server started")
            except Exception as e:
                st.error(f"Failed to start server: {e}")

    if st.button("Stop Server", disabled=st.session_state.server_proc is None):
        try:
            stop_server(st.session_state.server_proc)
            st.session_state.server_proc = None
            st.success("Server stopped")
        except Exception as e:
            st.error(f"Failed to stop server: {e}")


col1, col2 = st.columns(2)

with col1:
    st.subheader("Status")
    st.write("Node script:", f"`{NODE_SCRIPT.name}`")
    st.write("Process:", "running" if (st.session_state.server_proc and st.session_state.server_proc.poll() is None) else "stopped")
    st.write("Base URL:", base := base_url(host, int(port)))

    if st.button("Check Health"):
        try:
            r = requests.get(f"{base}/health", timeout=5)
            r.raise_for_status()
            st.success("Healthy")
            st.json(r.json())
        except Exception as e:
            st.error(f"Health check failed: {e}")

    if st.button("List Endpoints"):
        try:
            r = requests.get(f"{base}/spec/endpoints", timeout=8)
            r.raise_for_status()
            eps = r.json()
            st.write(f"Found {len(eps)} endpoints")
            st.json(eps)
        except Exception as e:
            st.error(f"Failed to fetch endpoints: {e}")

with col2:
    st.subheader("Server Logs")
    logs = tail_file(st.session_state.log_path)
    if logs:
        st.code(logs, language="bash")
    else:
        st.write("No logs yet.")


def _cleanup():
    stop_server(st.session_state.get("server_proc"))


atexit.register(_cleanup)


