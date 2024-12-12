import tkinter as tk
from tkinter import ttk
import json
import time
from datetime import datetime
import threading
from echo_operations import EchoOperations
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import matplotlib.animation as animation

class RateMonitorDashboard:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("ECHO2 Rate Monitor")
        self.root.geometry("800x600")
        
        # Initialize Echo Operations
        self.echo_ops = EchoOperations()
        
        # Initialize data storage with some initial data
        current_time = datetime.now()
        self.usage_data = {
            'timestamps': [current_time],
            'requests': [0],
            'input_tokens': [0],
            'output_tokens': [0]
        }
        print("Dashboard initialized with data structures")
        
        self._setup_ui()
        self._start_monitoring()

    def _setup_ui(self):
        # Create main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Current Usage Section
        usage_frame = ttk.LabelFrame(main_frame, text="Current Usage", padding="5")
        usage_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E))
        
        # Request Rate
        self.request_label = ttk.Label(usage_frame, text="Requests/min: 0/50")
        self.request_label.grid(row=0, column=0, padx=5, pady=5)
        self.request_progress = ttk.Progressbar(
            usage_frame, length=200, mode='determinate', maximum=50
        )
        self.request_progress.grid(row=0, column=1, padx=5, pady=5)
        
        # Input Tokens
        self.input_label = ttk.Label(usage_frame, text="Input Tokens/min: 0/40000")
        self.input_label.grid(row=1, column=0, padx=5, pady=5)
        self.input_progress = ttk.Progressbar(
            usage_frame, length=200, mode='determinate', maximum=40000
        )
        self.input_progress.grid(row=1, column=1, padx=5, pady=5)
        
        # Output Tokens
        self.output_label = ttk.Label(usage_frame, text="Output Tokens/min: 0/8000")
        self.output_label.grid(row=2, column=0, padx=5, pady=5)
        self.output_progress = ttk.Progressbar(
            usage_frame, length=200, mode='determinate', maximum=8000
        )
        self.output_progress.grid(row=2, column=1, padx=5, pady=5)
        
        # Usage Graph
        graph_frame = ttk.LabelFrame(main_frame, text="Usage Over Time", padding="5")
        graph_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Create matplotlib figure
        self.fig = Figure(figsize=(8, 4), dpi=100)
        self.ax = self.fig.add_subplot(111)
        self.canvas = FigureCanvasTkAgg(self.fig, master=graph_frame)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # Warning Section
        self.warning_frame = ttk.LabelFrame(main_frame, text="Status", padding="5")
        self.warning_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E))
        
        self.status_label = ttk.Label(self.warning_frame, text="System Status: Normal", foreground="green")
        self.status_label.grid(row=0, column=0, padx=5, pady=5)
        
        # Statistics Section
        stats_frame = ttk.LabelFrame(main_frame, text="Statistics", padding="5")
        stats_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E))
        
        self.total_requests_label = ttk.Label(stats_frame, text="Total Requests: 0")
        self.total_requests_label.grid(row=0, column=0, padx=5, pady=5)
        
        self.total_input_label = ttk.Label(stats_frame, text="Total Input Tokens: 0")
        self.total_input_label.grid(row=0, column=1, padx=5, pady=5)
        
        self.total_output_label = ttk.Label(stats_frame, text="Total Output Tokens: 0")
        self.total_output_label.grid(row=0, column=2, padx=5, pady=5)

    def _update_graph(self):
        self.ax.clear()
        self.ax.plot(self.usage_data['timestamps'], self.usage_data['requests'], 
                    label='Requests/min')
        self.ax.plot(self.usage_data['timestamps'], 
                    [x/800 for x in self.usage_data['input_tokens']], 
                    label='Input Tokens/min (÷800)')
        self.ax.plot(self.usage_data['timestamps'], 
                    [x/160 for x in self.usage_data['output_tokens']], 
                    label='Output Tokens/min (÷160)')
        self.ax.legend()
        self.ax.set_xlabel('Time')
        self.ax.set_ylabel('Usage')
        self.fig.autofmt_xdate()
        self.canvas.draw()

    def _update_ui(self):
        print("Updating UI...")
        report = self.echo_ops.get_usage_report()
        current = report['current_usage_percentages']
        cumulative = report['cumulative_stats']
        print(f"Current usage: {current}")
        print(f"Cumulative stats: {cumulative}")
        
        # Update progress bars
        self.request_progress['value'] = current['requests_usage']
        self.input_progress['value'] = current['input_tokens_usage']
        self.output_progress['value'] = current['output_tokens_usage']
        
        # Update labels
        self.request_label['text'] = f"Requests/min: {int(current['requests_usage']/2)}/50"
        self.input_label['text'] = f"Input Tokens/min: {int(current['input_tokens_usage']*400)}/40000"
        self.output_label['text'] = f"Output Tokens/min: {int(current['output_tokens_usage']*80)}/8000"
        
        # Update statistics
        self.total_requests_label['text'] = f"Total Requests: {cumulative['requests']}"
        self.total_input_label['text'] = f"Total Input Tokens: {cumulative['input_tokens']}"
        self.total_output_label['text'] = f"Total Output Tokens: {cumulative['output_tokens']}"
        
        # Update graph data
        self.usage_data['timestamps'].append(datetime.now())
        self.usage_data['requests'].append(current['requests_usage'])
        self.usage_data['input_tokens'].append(current['input_tokens_usage'])
        self.usage_data['output_tokens'].append(current['output_tokens_usage'])
        
        # Keep only last 60 data points
        if len(self.usage_data['timestamps']) > 60:
            for key in self.usage_data:
                self.usage_data[key] = self.usage_data[key][-60:]
        
        self._update_graph()
        
        # Schedule next update
        self.root.after(1000, self._update_ui)

    def _start_monitoring(self):
        self._update_ui()

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    dashboard = RateMonitorDashboard()
    dashboard.run()