#!/usr/bin/env python3
"""
Setup script for the multi-agent system
"""

import subprocess
import sys
import os
from pathlib import Path


def setup_environment():
    """Setup Python environment"""
    print("🔧 Configurando ambiente Python...")
    
    # Create virtual environment
    venv_path = Path("venv_agents")
    if not venv_path.exists():
        print("📦 Criando ambiente virtual...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_path)])
    
    # Activate and install dependencies
    pip_path = venv_path / ("Scripts" if sys.platform == "win32" else "bin") / "pip"
    
    print("📚 Instalando dependências...")
    subprocess.run([str(pip_path), "install", "-r", "requirements-agents.txt"])
    
    print("✅ Ambiente configurado com sucesso!")
    print(f"Para ativar: .\\{venv_path}\\Scripts\\activate (Windows)")


def setup_env_file():
    """Create .env file if it doesn't exist"""
    env_file = Path(".env.agents")
    
    if not env_file.exists():
        print("\n🔐 Criando arquivo .env...")
        env_content = """# Multi-Agent System Configuration
CREWAI_API_KEY=your_api_key_here
CREWAI_MODEL=gpt-4
REGION=Cruzeiro
LOG_LEVEL=INFO
"""
        env_file.write_text(env_content)
        print("✅ Arquivo .env criado (edite com suas credenciais)")
    else:
        print("✅ Arquivo .env já existe")


def test_agents():
    """Test if agents can be imported"""
    print("\n🧪 Testando sistema de agentes...")
    try:
        # Try to run the simple version first
        result = subprocess.run(
            [sys.executable, "agents_advanced.py"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ Agentes funcionando corretamente!")
            print("\nSaída:")
            print(result.stdout)
        else:
            print("⚠️  Erro ao executar agentes:")
            print(result.stderr)
    except subprocess.TimeoutExpired:
        print("⏱️  Timeout na execução dos agentes")
    except Exception as e:
        print(f"❌ Erro ao testar agentes: {e}")


def main():
    """Main setup"""
    print("\n" + "="*80)
    print("SETUP - SISTEMA DE AGENTES PARA DESENVOLVIMENTO DE NEGÓCIOS")
    print("="*80 + "\n")
    
    try:
        setup_environment()
        setup_env_file()
        
        print("\n" + "="*80)
        print("✨ SETUP CONCLUÍDO!")
        print("="*80)
        print("\nPróximos passos:")
        print("1. Edite o arquivo .env com suas credenciais de API")
        print("2. Execute: python agents_advanced.py")
        print("3. Os relatórios serão salvos em agent_report_*.json")
        print("\n" + "="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ Erro durante setup: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
