from pydantic import BaseModel, create_model, Field, ValidationError
from typing import Any, Dict, Type

def create_dynamic_model(name: str, attributes: Dict[str, Dict[str, str]]) -> Type[BaseModel]:
    field_definitions = {}
    for key, attr_info in attributes.items():
        attr_type = list(attr_info.keys())[0]
        validations = list(attr_info.values())[0]
        
        # Construct the Field with validations
        field_definitions[key] = (eval(attr_type), Field(**eval(f"dict({validations})")))
    print(field_definitions)
    return create_model(name, **field_definitions)

# Example attributes dictionary
attributes = {
    "optional_makeup_id": {"int": "gt=0"},
    "hair_stylist_id": {"int": "gt=0"},
    "is_complete": {"bool": "default=False"}
}

# Create the dynamic model
DynamicModel = create_dynamic_model("DynamicModel", attributes)

# Example data
data = {
    "optional_makeup_id": 1,
    "hair_stylist_id": 2,
    "is_complete": False
}

try:
    # Validate and create an instance of the dynamic model
    model_instance = DynamicModel(**data)
    print(model_instance)
except ValidationError as e:
    print("Validation error:", e)
