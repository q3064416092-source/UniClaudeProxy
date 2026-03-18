"""Configuration management API routes.

Provides RESTful endpoints for managing UniClaudeProxy configuration
through the web UI.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.config import (
    AppConfig,
    ModelConfig,
    ProviderConfig,
    ServerConfig,
    config_path,
    load_config,
    reload_config,
)

logger = logging.getLogger("uniclaudeproxy.api")

router = APIRouter(prefix="/api", tags=["config"])


@router.get("/status")
async def get_status() -> Dict[str, Any]:
    """Get proxy service status.

    Returns:
        Dict containing service status information.
    """
    cfg = load_config()
    return {
        "status": "running",
        "host": cfg.server.host,
        "port": cfg.server.port,
        "local_only": cfg.server.local_only,
        "providers_count": len(cfg.providers),
        "models_count": len(cfg.models),
    }


@router.get("/config")
async def get_config() -> Dict[str, Any]:
    """Get current configuration.

    Returns:
        Dict containing the full configuration.
    """
    try:
        cfg = load_config()
        return cfg.model_dump()
    except Exception as e:
        logger.error("Failed to load config: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to load config: {e}")


@router.put("/config")
async def update_config(request: Request) -> Dict[str, str]:
    """Update configuration.

    Args:
        request: FastAPI request containing new configuration JSON.

    Returns:
        Dict with success message.

    Raises:
        HTTPException: If validation or save fails.
    """
    try:
        body = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON body: {e}")

    # Validate configuration structure
    try:
        new_config = AppConfig(**body)
    except ValidationError as e:
        logger.error("Configuration validation failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Configuration validation failed: {e}")
    except Exception as e:
        logger.error("Failed to parse configuration: %s", e)
        raise HTTPException(status_code=400, detail=f"Failed to parse configuration: {e}")

    # Save to disk
    try:
        config_file = Path(config_path())
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(body, f, indent=2, ensure_ascii=False)
        
        logger.info("Configuration updated successfully")
        
        # Force reload to apply changes
        reload_config()
        
        return {"message": "Configuration updated successfully"}
    except Exception as e:
        logger.error("Failed to save config: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to save config: {e}")


@router.post("/config/validate")
async def validate_config(request: Request) -> Dict[str, Any]:
    """Validate configuration without saving.

    Args:
        request: FastAPI request containing configuration JSON to validate.

    Returns:
        Dict with validation result.

    Raises:
        HTTPException: If validation fails.
    """
    try:
        body = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON body: {e}")

    # Validate configuration structure
    try:
        validated_config = AppConfig(**body)
        
        # Additional semantic validations
        errors = []
        warnings = []
        
        # Check if all model mappings reference existing providers
        for model_name, mapping in validated_config.models.items():
            parts = mapping.split("/", 1)
            if len(parts) != 2:
                errors.append(f"Model '{model_name}' has invalid mapping format: '{mapping}'")
                continue
            
            provider_name, model_id = parts
            if provider_name not in validated_config.providers:
                errors.append(f"Model '{model_name}' references non-existent provider '{provider_name}'")
            else:
                provider = validated_config.providers[provider_name]
                if model_id not in provider.models:
                    warnings.append(f"Model '{model_name}' references non-existent model '{model_id}' in provider '{provider_name}'")
        
        # Check for empty providers
        for provider_name, provider in validated_config.providers.items():
            if not provider.models:
                warnings.append(f"Provider '{provider_name}' has no models configured")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
        }
        
    except ValidationError as e:
        logger.error("Configuration validation failed: %s", e)
        return {
            "valid": False,
            "errors": [str(e)],
            "warnings": [],
        }
    except Exception as e:
        logger.error("Failed to validate configuration: %s", e)
        raise HTTPException(status_code=400, detail=f"Failed to validate configuration: {e}")


@router.get("/config/export")
async def export_config() -> JSONResponse:
    """Export current configuration as downloadable JSON.

    Returns:
        JSONResponse with configuration file attachment.
    """
    try:
        cfg = load_config()
        return JSONResponse(
            content=cfg.model_dump(),
            headers={
                "Content-Disposition": "attachment; filename=config.json"
            }
        )
    except Exception as e:
        logger.error("Failed to export config: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to export config: {e}")


@router.post("/config/import")
async def import_config(request: Request) -> Dict[str, str]:
    """Import configuration from uploaded JSON.

    Args:
        request: FastAPI request containing configuration JSON.

    Returns:
        Dict with success message.

    Raises:
        HTTPException: If import or validation fails.
    """
    try:
        body = await request.json()
        
        # Validate before importing
        new_config = AppConfig(**body)
        
        # Save to disk
        config_file = Path(config_path())
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(body, f, indent=2, ensure_ascii=False)
        
        # Force reload
        reload_config()
        
        logger.info("Configuration imported successfully")
        return {"message": "Configuration imported successfully"}
        
    except ValidationError as e:
        logger.error("Import validation failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Import validation failed: {e}")
    except Exception as e:
        logger.error("Failed to import config: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to import config: {e}")
