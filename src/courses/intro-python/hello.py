# This is a simple Python program that greets the user by name
# It prompts the user to enter their name
name = input("what's your name? ").strip().title()

# Greet the user with their name
print(f"Hello, {name}!")



# End of the program
def main():
    name = input("what's your name? ").strip().title() 
    hello(name)

def hello(name = "world"):
    print(f"Hello, {name}!")    