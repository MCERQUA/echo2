from response_controller import controller

# Test current interaction
user_input = "ok proceed"
assistant_response = """I'll add the automatic enforcement code. We'll create a wrapper that I can use for my responses."""

# Record this interaction
controller.record_response(user_input, assistant_response)

# Keep the window open
controller.monitor.root.mainloop()