import os
import subprocess
import sys
import tempfile
from pathlib import Path

import streamlit as st
import time
import urllib.request
import urllib.error


PROJECT_ROOT = Path(__file__).parent.resolve()
NODE_BIN = "node"
CLI_SCRIPT = PROJECT_ROOT / "cli-start-from-spec.js"


def is_process_running(proc: subprocess.Popen | None) -> bool:
  return proc is not None and proc.poll() is None


def stop_server():
  proc = st.session_state.get("server_proc")
  if is_process_running(proc):
    try:
      proc.terminate()
      try:
        proc.wait(timeout=3)
      except subprocess.TimeoutExpired:
        proc.kill()
    except Exception:
      pass
  st.session_state["server_proc"] = None
  st.session_state["server_url"] = None
  st.session_state["startup_log"] = ""


def start_server(spec_path: Path, port: int, host: str):
  stop_server()
  env = os.environ.copy()
  cmd = [NODE_BIN, str(CLI_SCRIPT), str(spec_path), str(port), host]
  proc = subprocess.Popen(
    cmd,
    cwd=str(PROJECT_ROOT),
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1,
  )
  st.session_state["server_proc"] = proc
  display_host = "localhost" if host in {"0.0.0.0", "::", "::0"} else host
  st.session_state["server_url"] = f"http://{display_host}:{port}"

  # Read a few lines of startup logs and probe /health up to 10s
  st.session_state["startup_log"] = ""
  health_url = f"{st.session_state['server_url']}/health"
  start_time = time.time()
  while time.time() - start_time < 10:
    # Drain a couple of log lines if available
    try:
      if proc.stdout and not proc.stdout.closed:
        for _ in range(2):
          line = proc.stdout.readline()
          if not line:
            break
          st.session_state["startup_log"] += line
    except Exception:
      pass

    # Check health endpoint
    try:
      with urllib.request.urlopen(health_url, timeout=1.5) as resp:
        if resp.status == 200:
          break
    except urllib.error.URLError:
      pass
    except Exception:
      pass
    time.sleep(0.5)


st.set_page_config(page_title="OpenAPI Mock Server", page_icon="🧪", layout="centered")
st.title("OpenAPI Mock Server UI")
st.caption("Upload an OpenAPI JSON/YAML file and start a mock server.")

if "server_proc" not in st.session_state:
  st.session_state["server_proc"] = None
if "server_url" not in st.session_state:
  st.session_state["server_url"] = None

with st.form("upload-form"):
  uploaded = st.file_uploader(
    "OpenAPI file (.json, .yaml, .yml)", type=["json", "yaml", "yml"], accept_multiple_files=False
  )
  col1, col2, col3 = st.columns([1, 1, 1])
  with col1:
    port = st.number_input("Port", min_value=1, max_value=65535, value=8000, step=1)
  with col2:
    host = st.text_input("Host", value="localhost")
  with col3:
    run = st.form_submit_button("Start / Restart Server", use_container_width=True)

if run and uploaded is not None:
  suffix = ".json" if uploaded.type == "application/json" else (".yaml" if uploaded.type in {"application/x-yaml", "text/yaml"} else f".{uploaded.name.split('.')[-1]}")
  temp_dir = Path(tempfile.mkdtemp(prefix="openapi-mock-"))
  temp_file = temp_dir / f"uploaded{suffix}"
  with open(temp_file, "wb") as f:
    f.write(uploaded.getbuffer())
  start_server(temp_file, int(port), host)

status_col1, status_col2 = st.columns([2, 1])
with status_col1:
  running = is_process_running(st.session_state.get("server_proc"))
  if running:
    st.success(f"Server running at {st.session_state['server_url']}")
    st.write("Try:")
    st.code(f"curl {st.session_state['server_url']}/health", language="bash")
    st.code(f"curl {st.session_state['server_url']}/spec/info", language="bash")
  else:
    st.info("Server not running.")
  if st.session_state.get("startup_log"):
    st.expander("Startup logs").code(st.session_state["startup_log"], language="bash")

with status_col2:
  if st.button("Stop Server", disabled=not running, use_container_width=True):
    stop_server()
    st.toast("Server stopped", icon="🛑")

st.divider()
st.markdown("""
- The server starts in a background process using Node.js.
- You can upload either JSON or YAML OpenAPI files.
- If you change port/host, click Start/Restart to apply.
""")


