from fastapi import APIRouter, Request
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/geo", tags=["geo"])


@router.get("/detect")
async def detect_geo(request: Request):
    # Get client IP from headers (Railway/proxy forwards real IP)
    client_ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.headers.get("x-real-ip")
        or request.client.host
    )

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"http://ip-api.com/json/{client_ip}?fields=status,country,countryCode,proxy,hosting")
            data = resp.json()

        if data.get("status") != "success":
            return {"country_code": "UNKNOWN", "is_vpn": False, "region": "global"}

        country_code = data.get("countryCode", "UNKNOWN")
        is_vpn = data.get("proxy", False) or data.get("hosting", False)

        return {
            "country_code": country_code,
            "country": data.get("country", "Unknown"),
            "is_vpn": is_vpn,
            "region": "india" if country_code == "IN" else "global"
        }
    except Exception as e:
        logger.error(f"Geo detection failed: {e}")
        return {"country_code": "UNKNOWN", "is_vpn": False, "region": "global"}
