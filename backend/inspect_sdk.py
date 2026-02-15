
import paydunya

def inspect_sdk():
    invoice = paydunya.Invoice()
    print("Methods in paydunya.Invoice:")
    for method in dir(invoice):
        if not method.startswith("__"):
            print(f"- {method}")

if __name__ == "__main__":
    inspect_sdk()
