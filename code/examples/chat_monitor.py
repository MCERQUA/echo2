import tkinter as tk
from tkinter import ttk
import time
from datetime import datetime

class ChatSessionMonitor:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Echo Chat Session Monitor")
        self.root.geometry("400x300")  # Smaller, focused size
        
        # Current limits
        self.RPM_LIMIT = 50
        self.INPUT_TPM_LIMIT = 40000
        self.OUTPUT_TPM_LIMIT = 8000
        
        # Session stats
        self.session_start = datetime.now()
        self.request_count = 0
        self.input_tokens = 0
        self.output_tokens = 0
        
        # Token tracking
        self.last_request_time = None
        self.token_history = []  # List of (timestamp, input_tokens, output_tokens)
        
        # Simple token estimation (can be refined later)
        self.AVG_CHARS_PER_TOKEN = 4  # Rough estimate
        
        self._setup_ui()
        self._start_monitoring()

    def _setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="5")
        main_frame.grid(row=0, column=0, sticky="nsew")
        
        # Session Info
        session_frame = ttk.LabelFrame(main_frame, text="Session Info", padding="5")
        session_frame.grid(row=0, column=0, sticky="ew", padx=5, pady=5)
        
        self.session_time_label = ttk.Label(session_frame, text="Session Duration: 0:00:00")
        self.session_time_label.grid(row=0, column=0, sticky="w")
        
        # Current Usage
        usage_frame = ttk.LabelFrame(main_frame, text="Current Usage", padding="5")
        usage_frame.grid(row=1, column=0, sticky="ew", padx=5, pady=5)
        
        # Requests
        ttk.Label(usage_frame, text="Requests/min:").grid(row=0, column=0, sticky="w")
        self.request_progress = ttk.Progressbar(usage_frame, length=200, mode='determinate', maximum=50)
        self.request_progress.grid(row=0, column=1, padx=5)
        self.request_label = ttk.Label(usage_frame, text="0/50")
        self.request_label.grid(row=0, column=2)
        
        # Input Tokens
        ttk.Label(usage_frame, text="Input Tokens/min:").grid(row=1, column=0, sticky="w")
        self.input_progress = ttk.Progressbar(usage_frame, length=200, mode='determinate', maximum=40000)
        self.input_progress.grid(row=1, column=1, padx=5)
        self.input_label = ttk.Label(usage_frame, text="0/40K")
        self.input_label.grid(row=1, column=2)
        
        # Output Tokens
        ttk.Label(usage_frame, text="Output Tokens/min:").grid(row=2, column=0, sticky="w")
        self.output_progress = ttk.Progressbar(usage_frame, length=200, mode='determinate', maximum=8000)
        self.output_progress.grid(row=2, column=1, padx=5)
        self.output_label = ttk.Label(usage_frame, text="0/8K")
        self.output_label.grid(row=2, column=2)
        
        # Status
        self.status_label = ttk.Label(main_frame, text="Status: Normal", foreground="green")
        self.status_label.grid(row=2, column=0, sticky="w", padx=5, pady=5)

    def _start_monitoring(self):
        """Update the display every second"""
        self._update_display()
        self.root.after(1000, self._start_monitoring)

    def _update_display(self):
        # Update session duration
        duration = datetime.now() - self.session_start
        hours, remainder = divmod(duration.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        self.session_time_label.config(
            text=f"Session Duration: {hours}:{minutes:02d}:{seconds:02d}"
        )
        
        # This will be replaced with actual monitoring logic
        # For now just showing the structure
        self.request_progress['value'] = (self.request_count / self.RPM_LIMIT) * 100
        self.request_label['text'] = f"{self.request_count}/{self.RPM_LIMIT}"
        
        self.input_progress['value'] = (self.input_tokens / self.INPUT_TPM_LIMIT) * 100
        self.input_label['text'] = f"{self.input_tokens:,}/{self.INPUT_TPM_LIMIT:,}"
        
        self.output_progress['value'] = (self.output_tokens / self.OUTPUT_TPM_LIMIT) * 100
        self.output_label['text'] = f"{self.output_tokens:,}/{self.OUTPUT_TPM_LIMIT:,}"

    def estimate_tokens(self, text: str) -> int:
        """Estimate token count from text"""
        return len(text) // self.AVG_CHARS_PER_TOKEN

    def record_interaction(self, input_text: str, output_text: str) -> float:
        """
        Record a chat interaction and return recommended wait time.
        Returns the number of seconds to wait before next interaction.
        """
        current_time = time.time()
        
        # Calculate token counts
        input_tokens = self.estimate_tokens(input_text)
        output_tokens = self.estimate_tokens(output_text)
        
        # Clean history older than 1 minute
        current_minute = current_time - 60
        self.token_history = [(t, i, o) for t, i, o in self.token_history if t > current_minute]
        
        # Calculate current minute's usage
        minute_input_tokens = sum(i for _, i, _ in self.token_history)
        minute_output_tokens = sum(o for _, _, o in self.token_history)
        minute_requests = len(self.token_history)
        
        # Add current interaction
        self.token_history.append((current_time, input_tokens, output_tokens))
        
        # Update totals for display
        self.request_count = minute_requests + 1
        self.input_tokens = minute_input_tokens + input_tokens
        self.output_tokens = minute_output_tokens + output_tokens

        # Calculate recommended wait time
        wait_time = 0
        
        # If we're above 80% of any limit, enforce waiting
        if self.request_count >= self.RPM_LIMIT * 0.8:
            wait_time = max(wait_time, 60 / (self.RPM_LIMIT * 0.8))  # Space out remaining requests
            
        if self.input_tokens >= self.INPUT_TPM_LIMIT * 0.8:
            wait_time = max(wait_time, 3.0)  # More conservative wait for token limits
            
        if self.output_tokens >= self.OUTPUT_TPM_LIMIT * 0.8:
            wait_time = max(wait_time, 3.0)
            
        # Update status display
        if wait_time > 0:
            self.status_label.config(
                text=f"Status: Cooling Down ({wait_time:.1f}s)", 
                foreground="orange"
            )
        else:
            self.status_label.config(
                text="Status: Normal", 
                foreground="green"
            )
            
        return wait_time
        
        # Update immediately
        self._update_display()
        
        # Check if approaching limits
        if (self.request_count >= self.RPM_LIMIT * 0.8 or
            self.input_tokens >= self.INPUT_TPM_LIMIT * 0.8 or
            self.output_tokens >= self.OUTPUT_TPM_LIMIT * 0.8):
            self.status_label.config(text="Status: Approaching Limits", foreground="orange")
        
        if (self.request_count >= self.RPM_LIMIT or
            self.input_tokens >= self.INPUT_TPM_LIMIT or
            self.output_tokens >= self.OUTPUT_TPM_LIMIT):
            self.status_label.config(text="Status: Rate Limited", foreground="red")

if __name__ == "__main__":
    monitor = ChatSessionMonitor()
    monitor.root.mainloop()