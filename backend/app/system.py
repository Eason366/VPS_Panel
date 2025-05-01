from fastapi import APIRouter
import psutil
import time
import platform
import datetime
import os

router = APIRouter()

# 用于网络速率（上次读取值）
last_net = psutil.net_io_counters()
last_time = time.time()

@router.get("/api/stats")
async def get_system_stats():
    global last_net, last_time

    # 当前时间
    current_time = time.time()
    net = psutil.net_io_counters()
    duration = current_time - last_time
    net_sent_rate = (net.bytes_sent - last_net.bytes_sent) / duration
    net_recv_rate = (net.bytes_recv - last_net.bytes_recv) / duration
    last_net, last_time = net, current_time

    # CPU
    cpu_percent = psutil.cpu_percent(interval=0.2)
    cpu_count_logical = psutil.cpu_count()
    cpu_count_physical = psutil.cpu_count(logical=False)

    # 内存
    mem = psutil.virtual_memory()

    # 磁盘
    disk = psutil.disk_usage("/")

    # 平均负载（仅 Linux/macOS 支持）
    try:
        load1, load5, load15 = os.getloadavg()
    except OSError:
        load1 = load5 = load15 = 0

    # 系统运行时间
    boot_time = psutil.boot_time()
    uptime_seconds = int(time.time() - boot_time)
    uptime_str = str(datetime.timedelta(seconds=uptime_seconds))

    # Top 进程（按 CPU 使用排序）
    processes = []
    for p in psutil.process_iter(attrs=["pid", "name", "cpu_percent", "memory_percent"]):
        try:
            proc = p.info
            processes.append(proc)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    top_processes = sorted(processes, key=lambda x: x["cpu_percent"], reverse=True)[:5]

    return {
        "cpu": {
            "percent": cpu_percent,
            "cores": cpu_count_physical,
            "threads": cpu_count_logical
        },
        "memory": {
            "total": mem.total,
            "used": mem.used,
            "percent": mem.percent,
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": round(disk.used / disk.total * 100, 2),
        },
        "network": {
            "sent_rate": net_sent_rate,
            "recv_rate": net_recv_rate,
            "sent_total": net.bytes_sent,
            "recv_total": net.bytes_recv,
        },
        "uptime": {
            "boot_time": boot_time,
            "uptime": uptime_str
        },
        "load": {
            "load_1": load1,
            "load_5": load5,
            "load_15": load15
        },
        "top_processes": top_processes
    }
