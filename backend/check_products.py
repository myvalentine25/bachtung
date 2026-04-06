from database import SessionLocal
from models import Product

db = SessionLocal()
try:
    products = db.query(Product).all()
    if products:
        print(f'Found {len(products)} products:')
        print('-' * 80)
        for product in products:
            print(f'ID: {product.id}')
            print(f'Name: {product.product_description}')
            print(f'Manufacturing Cost: ${product.cost:.2f}')
            print(f'Selling Price: ${product.price:.2f}')
            print(f'Labor Cost: ${product.labor_cost:.2f}')
            total_cost = product.cost + product.labor_cost
            profit = product.price - total_cost
            margin = (profit / total_cost * 100) if total_cost > 0 else 0
            print(f'Profit Margin: {margin:.1f}%')
            print('-' * 40)
    else:
        print('No products found in database')
finally:
    db.close()