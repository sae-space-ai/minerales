"""Configuration objects for the OpenHands runtime.

Only the subset of configuration actually consumed by the runtime code lives
here; extend as needed when new options are introduced.
"""

from pydantic import BaseModel, Field


class MCPConfig(BaseModel):
    """Configuration for the built-in MCP servers exposed by the runtime."""

    mcp_sse_servers: list[dict] = Field(default_factory=list)
    mcp_stdio_servers: list[dict] = Field(default_factory=list)
    mcp_sse_suppliers: list[str] = Field(default_factory=list)
    mcp_stdio_suppliers: list[str] = Field(default_factory=list)


class SandboxConfig(BaseModel):
    """Configuration for how the action execution server is launched inside
    the sandbox environment."""

    api_key: str | None = None
    remote_runtime_base_url: str = 'http://localhost:35123'
    base_container_image: str = ''
    runtime_builder: str = 'docker'
    enable_auto_lint: bool = False
    user_id: int | None = None
    username: str | None = None
    browsergym_eval_env: str | None = None


class OpenHandsConfig(BaseModel):
    """Top-level application configuration used by the runtime utilities."""

    sandbox: SandboxConfig = Field(default_factory=SandboxConfig)
    mcp: MCPConfig = Field(default_factory=MCPConfig)
    run_as_openhands: bool = True
    enable_browser: bool = True
    workspace_mount_path_in_sandbox: str = '/workspace'
