"""
Pydantic-схемы для финансовых транзакций.
"""

from datetime import datetime

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    """Информация о транзакции в истории баланса."""
    id: int
    type: str  # purchase / deduction / refund / manual
    amount: int
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}
