from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from blockchain import web3_service


router = APIRouter(prefix="/blockchain", tags=["blockchain"])


class BlockchainCampaignCreate(BaseModel):
    title: str = Field(..., examples=["Cứu trợ vùng cao"])
    description: str = Field(..., examples=["Hỗ trợ học sinh nghèo vùng cao mua áo ấm."])
    receiver: str = Field(..., examples=["0x0000000000000000000000000000000000000000"])
    target_amount_eth: float = Field(..., gt=0, examples=[5.0])
    private_key: str = Field(..., examples=["0x..."])


class BlockchainDonate(BaseModel):
    campaign_id: int = Field(..., ge=1, examples=[1])
    amount_eth: float = Field(..., gt=0, examples=[0.5])
    donor_private_key: str = Field(..., examples=["0x..."])


@router.get("/campaign-count")
def get_blockchain_campaign_count():
    return _handle_web3_call(web3_service.get_campaign_count)


@router.post("/campaigns", status_code=status.HTTP_201_CREATED)
def create_blockchain_campaign(payload: BlockchainCampaignCreate):
    return _handle_web3_call(
        web3_service.create_campaign,
        title=payload.title,
        description=payload.description,
        receiver=payload.receiver,
        target_amount=payload.target_amount_eth,
        private_key=payload.private_key,
    )


@router.post("/donate")
def donate_blockchain(payload: BlockchainDonate):
    return _handle_web3_call(
        web3_service.donate,
        campaign_id=payload.campaign_id,
        amount_eth=payload.amount_eth,
        donor_private_key=payload.donor_private_key,
    )


@router.get("/campaigns/{campaign_id}")
def get_blockchain_campaign(campaign_id: int):
    return _handle_web3_call(web3_service.get_campaign, campaign_id=campaign_id)


@router.get("/events/donations")
def get_blockchain_donation_events(limit: int = 10):
    return _handle_web3_call(web3_service.get_latest_donation_events, limit=limit)


def _handle_web3_call(func, **kwargs):
    try:
        return func(**kwargs)
    except ConnectionError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
