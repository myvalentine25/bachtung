from sqlalchemy.orm import Session
from backend.models import EmployeeOutputs, ProductProcessRequirements, EmployeeSkillPrice

def calculate_completion(db: Session, employee_id: int, product_id: int, work_date: str):
	"""Tính % hoàn thành từng công đoạn"""
	output = db.query(EmployeeOutputs).filter_by(employee_id=employee_id, product_id=product_id, work_date=work_date).first()
	requirement = db.query(ProductProcessRequirements).filter_by(product_id=product_id).first()
	if not output or not requirement:
		return None

	completion = {}
	for field in ['cut', 'shave', 'sharpen', 'paste', 'press', 'staple']:
		output_val = getattr(output, f"{field}_output")
		req_val = getattr(requirement, field)
		completion[field] = round((output_val / req_val) * 100, 2) if req_val > 0 else 0

	return completion

def calculate_labor_cost(db: Session, employee_id: int, product_id: int, work_date: str):
	"""Tính chi phí nhân công cho từng công đoạn"""
	output = db.query(EmployeeOutputs).filter_by(employee_id=employee_id, product_id=product_id, work_date=work_date).first()
	skill_price = db.query(EmployeeSkillPrice).filter_by(employee_id=employee_id).first()
	if not output or not skill_price:
		return None

	cost = {}
	for field in ['cut', 'shave', 'sharpen', 'paste', 'press', 'staple']:
		output_val = getattr(output, f"{field}_output")
		price_val = getattr(skill_price, f"{field}_price")
		cost[field] = round(output_val * price_val, 2)

	cost['total'] = sum(cost.values())
	return cost

def predict_productivity(db: Session, employee_id: int, product_id: int):
	"""Dự đoán năng suất dựa trên trung bình lịch sử"""
	outputs = db.query(EmployeeOutputs).filter_by(employee_id=employee_id, product_id=product_id).all()
	if not outputs:
		return None
	prediction = {}
	for field in ['cut_output', 'shave_output', 'sharpen_output', 'paste_output', 'press_output', 'staple_output']:
		avg = sum(getattr(o, field) for o in outputs) / len(outputs)
		prediction[field] = round(avg, 2)
	return prediction
