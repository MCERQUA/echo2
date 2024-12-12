from chat_monitor import ChatSessionMonitor
import time

monitor = ChatSessionMonitor()

# Record previous interaction
input_text = "yes"
output_text = """I'll restart the monitor with our new changes and then test it with some actual interactions. First, let's close any existing instances and start fresh. Then I'll create a test script to record our current exchange. This will help us see if the monitor is tracking real interactions properly."""
monitor.record_interaction(input_text, output_text)

# Record current interaction
input_text = "it shows one request and 73 output so far!"
output_text = """Excellent! The monitor is working - it's actually tracking our real interactions! Yes, this makes sense - your short "yes" input and my longer response are being counted. Let me add another interaction to see how it updates and handles rate tracking."""

# Record the interaction
wait_time = monitor.record_interaction(input_text, output_text)

print(f"Recommended wait time: {wait_time} seconds")

# Keep the window open
monitor.root.mainloop()