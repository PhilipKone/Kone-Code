# Add two numbers and round the result to 2 decimal places
x = float(input("Enter first number: "))
y = float(input("Enter second number: "))

result = round(x + y, 2)
print(f"The sum is {result}")

# Subtract two numbers and round the result to 2 decimal places
result = round(x - y, 2)
print(f"The difference is {result}")

# Multiply two numbers and round the result to 2 decimal places
result = round(x * y, 2)
print(f"The product is {result}")

# Divide two numbers and round the result to 2 decimal places
if y != 0:
    result = round(x / y, 2)
    print(f"The quotient is {result}")
else:
    print("Error: Division by zero is not allowed.") 

# End of the program

def main():
    x = float(input("Enter first number: "))
    y = float(input("Enter second number: "))
    add(x, y)
    subtract(x, y)
    multiply(x, y)
    divide(x, y)
def add(x, y):
    result = round(x + y, 2)
    print(f"The sum is {result}")
def subtract(x, y):
    result = round(x - y, 2)
    print(f"The difference is {result}")
def multiply(x, y):
    result = round(x * y, 2)
    print(f"The product is {result}")
def divide(x, y):
    if y != 0:
        result = round(x / y, 2)
        print(f"The quotient is {result}")
    else:
        print("Error: Division by zero is not allowed.")    