#!/usr/bin/env python3
"""
Multi-Agent System for Business Development in Cruzeiro Region
"""

from crewai import Agent, Task, Crew
from crewai_tools import tool
import json
from datetime import datetime


# ==================== TOOLS ====================

@tool
def search_clients(region: str, industry: str = None) -> str:
    """Search for potential clients and businesses in a specific region"""
    return f"Searching for clients in {region}. Industry: {industry if industry else 'All'}"


@tool
def analyze_business_vulnerabilities(company_name: str, industry: str) -> str:
    """Analyze potential vulnerabilities in a business"""
    return f"Analyzing vulnerabilities for {company_name} in {industry} sector"


@tool
def search_market_data(region: str) -> str:
    """Fetch current market data and trends for a region"""
    return f"Retrieving market data for {region}"


@tool
def structure_solution(vulnerabilities: str, budget: str = None) -> str:
    """Structure business solutions based on identified vulnerabilities"""
    return f"Structuring solution for: {vulnerabilities}"


@tool
def create_proposal(company_name: str, solution: str, estimated_cost: str) -> str:
    """Create a business proposal for a potential client"""
    return f"Proposal created for {company_name}"


@tool
def plan_execution(proposal: str, timeline_days: int = 30) -> str:
    """Plan execution steps and contract closure strategy"""
    return f"Execution plan created with {timeline_days} day timeline"


# ==================== AGENTS ====================

research_agent = Agent(
    role="Research Specialist",
    goal="Find potential clients and analyze their business vulnerabilities in Cruzeiro region",
    backstory="Expert researcher with deep knowledge of the Cruzeiro region's business landscape. "
              "Focuses on identifying high-potential clients and understanding their pain points.",
    tools=[search_clients, analyze_business_vulnerabilities, search_market_data],
    verbose=True,
    allow_delegation=False
)

analysis_agent = Agent(
    role="Business Analyst",
    goal="Analyze vulnerabilities and structure comprehensive business solutions",
    backstory="Strategic business analyst with expertise in solution design. "
              "Transforms raw data into actionable insights and structured solutions.",
    tools=[structure_solution],
    verbose=True,
    allow_delegation=False
)

execution_agent = Agent(
    role="Sales & Execution Manager",
    goal="Create proposals and plan execution strategy to close contracts",
    backstory="Experienced sales professional skilled in proposal creation and contract negotiation. "
              "Specializes in turning analysis into closed deals.",
    tools=[create_proposal, plan_execution],
    verbose=True,
    allow_delegation=False
)


# ==================== TASKS ====================

research_task = Task(
    description="Research potential clients in Cruzeiro region. Identify at least 5 companies "
                "with potential vulnerabilities in their operations. Provide detailed findings "
                "about their business, sector, and identified pain points.",
    expected_output="Comprehensive list of potential clients with vulnerability analysis",
    agent=research_agent
)

analysis_task = Task(
    description="Analyze the research findings and structure 2-3 comprehensive solutions "
                "tailored to the identified vulnerabilities. Each solution should address "
                "specific pain points and provide clear value propositions.",
    expected_output="Structured solutions with value propositions and implementation strategies",
    agent=analysis_agent,
    context=[research_task]
)

execution_task = Task(
    description="Create detailed proposals for the top 2 identified opportunities. "
                "For each proposal, outline the execution timeline, contract closure steps, "
                "and pricing strategy to maximize contract closing probability.",
    expected_output="Professional proposals with execution plans and contract closure strategies",
    agent=execution_agent,
    context=[analysis_task]
)


# ==================== CREW ====================

crew = Crew(
    agents=[research_agent, analysis_agent, execution_agent],
    tasks=[research_task, analysis_task, execution_task],
    verbose=True
)


def run_agents():
    """Execute the multi-agent system"""
    print("\n" + "="*80)
    print("INICIANDO SISTEMA DE AGENTES - DESENVOLVIMENTO DE NEGÓCIOS CRUZEIRO")
    print("="*80 + "\n")
    
    result = crew.kickoff()
    
    print("\n" + "="*80)
    print("RESULTADO FINAL DO SISTEMA DE AGENTES")
    print("="*80)
    print(result)
    
    return result


if __name__ == "__main__":
    run_agents()
