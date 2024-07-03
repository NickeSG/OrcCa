# backend/app.py

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from collections import defaultdict

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///orcamento.db'
db = SQLAlchemy(app)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))
    category = db.Column(db.String(50))
    amount = db.Column(db.Float)
    date = db.Column(db.Date)
    installment_count = db.Column(db.Integer, nullable=True)
    interest = db.Column(db.Float, nullable=True)

db.create_all()

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    data = request.get_json()
    new_transaction = Transaction(
        type=data['type'],
        category=data['category'],
        amount=data['amount'],
        date=datetime.strptime(data['date'], '%Y-%m-%d'),
        installment_count=data.get('installment_count'),
        interest=data.get('interest')
    )
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction added successfully'})

@app.route('/get_transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([{
        'id': t.id,
        'type': t.type,
        'category': t.category,
        'amount': t.amount,
        'date': t.date.strftime('%Y-%m-%d'),
        'installment_count': t.installment_count,
        'interest': t.interest
    } for t in transactions])

@app.route('/get_daily_balance', methods=['GET'])
def get_daily_balance():
    transactions = Transaction.query.order_by(Transaction.date).all()
    daily_balance = defaultdict(float)
    balance = 0

    for t in transactions:
        balance += t.amount if t.type == 'receita' else -t.amount
        daily_balance[t.date] = balance

    return jsonify([{'date': k.strftime('%Y-%m-%d'), 'balance': v} for k, v in daily_balance.items()])

@app.route('/get_monthly_balance', methods=['GET'])
def get_monthly_balance():
    transactions = Transaction.query.order_by(Transaction.date).all()
    monthly_balance = defaultdict(float)
    balance = 0

    for t in transactions:
        month = t.date.strftime('%Y-%m')
        balance += t.amount if t.type == 'receita' else -t.amount
        monthly_balance[month] = balance

    return jsonify([{'month': k, 'balance': v} for k, v in monthly_balance.items()])

@app.route('/get_summary', methods=['GET'])
def get_summary():
    transactions = Transaction.query.all()
    summary = defaultdict(lambda: {'receita': 0, 'despesa': 0})

    for t in transactions:
        summary[t.category][t.type] += t.amount

    return jsonify([{'category': k, 'receita': v['receita'], 'despesa': v['despesa']} for k, v in summary.items()])

if __name__ == '__main__':
    app.run(debug=True)
