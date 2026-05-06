from backend.app.db.schemas import IrrigationInput, IrrigationResponse
from backend.app.ml.irrigation_model import irrigation_model
from sqlalchemy.orm import Session

def predict_irrigation(
    data: IrrigationInput,
    db: Session
) -> IrrigationResponse:

    result = irrigation_model.predict(
        crop           = data.crop,
        soil_type      = data.soil_type,
        growth_stage   = data.growth_stage,
        temperature    = data.temperature,
        humidity       = data.humidity,
        rainfall       = data.rainfall,
        wind_speed     = data.wind_speed,
        sunshine_hours = data.sunshine_hours,
    )

    return IrrigationResponse(
        water_requirement = result["water_requirement"],
        net_irrigation    = result["net_irrigation"],
        weekly_total      = result["weekly_total"],
        daily_minutes     = result["daily_minutes"],
        frequency         = result["frequency"],
        unit              = result["unit"],
        status            = "success"
    )