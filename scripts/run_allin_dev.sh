#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${1:-}
PORT=${2:-}

if [[ -z "${APP_DIR}" || -z "${PORT}" ]]; then
  echo "Usage: $0 <app_dir> <port>" >&2
  exit 1
fi

CMD=(npm run dev -- --host --port "${PORT}" --strictPort)

get_port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"${port}" 2>/dev/null || true
  else
    python3 - "$port" <<'PY'
import os
import sys

port = int(sys.argv[1])
targets = set()

def collect(table):
    try:
        with open(table, "r", encoding="utf-8") as fh:
            next(fh)
            for line in fh:
                parts = line.split()
                if len(parts) < 10:
                    continue
                local = parts[1]
                inode = parts[9]
                try:
                    local_port = int(local.split(":")[1], 16)
                except (IndexError, ValueError):
                    continue
                if local_port == port:
                    targets.add(inode)
    except FileNotFoundError:
        return

collect("/proc/net/tcp")
collect("/proc/net/tcp6")

pids = set()

for pid in os.listdir("/proc"):
    if not pid.isdigit():
        continue
    fd_dir = os.path.join("/proc", pid, "fd")
    try:
        for fd in os.listdir(fd_dir):
            try:
                target = os.readlink(os.path.join(fd_dir, fd))
            except OSError:
                continue
            if not target.startswith("socket:["):
                continue
            inode = target.split("[", 1)[1].rstrip("]")
            if inode in targets:
                pids.add(pid)
                break
    except FileNotFoundError:
        continue

if pids:
    for pid in sorted(pids, key=int):
        print(pid)
PY
  fi
}

while true; do
  PIDS=$(get_port_pids "${PORT}")
  if [[ -z "${PIDS}" ]]; then
    break
  fi
  PID=$(printf '%s\n' "${PIDS}" | head -n 1)
  echo "Port ${PORT} is already in use by process ${PID}."
  read -r -p "kill process PID ${PID}? y/n " ANSWER
  case "${ANSWER}" in
    y|Y)
      if kill "${PID}" >/dev/null 2>&1; then
        echo "Killed process ${PID}."
      else
        echo "Failed to kill process ${PID}."
      fi
      sleep 1
      continue
      ;;
    n|N)
      echo "Exiting."
      exit 1
      ;;
    *)
      echo "Please answer y or n."
      continue
      ;;
  esac
done

cd "${APP_DIR}"
exec "${CMD[@]}"
