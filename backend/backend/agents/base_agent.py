"""
MatruRaksha AI - Base Agent Class
All specialized agents inherit from this base class
"""

import os
import logging
from typing import Dict, Any, List
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

# Import Gemini
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    else:
        GEMINI_AVAILABLE = False
except:
    GEMINI_AVAILABLE = False

# Select model via env hook (supports fine-tuned model names)
GEMINI_MODEL_NAME = (
    os.getenv("GEMINI_SFT_MODEL")
    or os.getenv("GEMINI_MODEL_NAME")
    or "gemini-2.5-flash"
)


class BaseAgent(ABC):
    """Base class for all specialized agents"""
    
    def __init__(self, agent_name: str, agent_role: str):
        self.agent_name = agent_name
        self.agent_role = agent_role
        self.model = None
        
        if GEMINI_AVAILABLE:
            try:
                self.model = genai.GenerativeModel(GEMINI_MODEL_NAME)
                logger.info(f"✅ {agent_name} initialized with Gemini model: {GEMINI_MODEL_NAME}")
            except Exception as e:
                logger.error(f"❌ {agent_name} failed to initialize: {e}")

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt for this agent"""
        pass
    
    def build_context(self, mother_context: Dict[str, Any], reports_context: List[Dict[str, Any]]) -> str:
        """Build comprehensive context string for AI prompt with all available records"""
        context_parts = [
            "===== COMPREHENSIVE MOTHER PROFILE =====",
            f"Name: {mother_context.get('name', 'N/A')}",
            f"Age: {mother_context.get('age', 'N/A')} years",
            f"Gravida: {mother_context.get('gravida', 'N/A')}",
            f"Parity: {mother_context.get('parity', 'N/A')}",
            f"BMI: {mother_context.get('bmi', 'N/A')}",
            f"Location: {mother_context.get('location', 'N/A')}",
        ]
        
        # Add height and weight if available
        if mother_context.get('height_cm'):
            context_parts.append(f"Height: {mother_context.get('height_cm')} cm")
        if mother_context.get('weight_kg'):
            context_parts.append(f"Current Weight: {mother_context.get('weight_kg')} kg")
        
        # Add due date if available
        due_date = mother_context.get('due_date')
        if due_date:
            try:
                from datetime import datetime
                due_dt = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                due_str = due_dt.strftime("%B %d, %Y")
                # Calculate pregnancy week (assuming 40 weeks from LMP to due date)
                today = datetime.now()
                if due_dt > today:
                    # Due date is in the future - calculate weeks remaining
                    days_remaining = (due_dt - today).days
                    weeks_remaining = days_remaining // 7
                    weeks_pregnant = 40 - weeks_remaining
                    if weeks_pregnant < 0:
                        weeks_pregnant = 0
                    if weeks_pregnant > 40:
                        weeks_pregnant = 40
                    months_pregnant = (weeks_pregnant // 4) + 1
                    trimester = "First" if weeks_pregnant <= 13 else ("Second" if weeks_pregnant <= 27 else "Third")
                    context_parts.append(f"Due Date: {due_str}")
                    context_parts.append(f"Current Pregnancy: {weeks_pregnant} weeks ({months_pregnant} months) - {trimester} Trimester")
                else:
                    context_parts.append(f"Due Date: {due_str} (Past due date)")
            except:
                context_parts.append(f"Due Date: {due_date[:10] if due_date else 'Not set'}")
        
        context_parts.append("")
        
        # Add appointments if available
        next_appt = mother_context.get('next_appointment')
        appointments = mother_context.get('appointments', [])
        
        if next_appt:
            appt_date = next_appt.get('appointment_date', '')
            appt_type = next_appt.get('appointment_type', '')
            facility = next_appt.get('facility', '')
            status = next_appt.get('status', '')
            try:
                from datetime import datetime
                appt_dt = datetime.fromisoformat(appt_date.replace('Z', '+00:00'))
                pretty_date = appt_dt.strftime("%B %d, %Y at %I:%M %p")
            except:
                pretty_date = appt_date
            context_parts.append("===== NEXT APPOINTMENT =====")
            context_parts.append(f"Date/Time: {pretty_date}")
            if facility:
                context_parts.append(f"Facility: {facility}")
            if appt_type:
                context_parts.append(f"Type: {appt_type}")
            if status:
                context_parts.append(f"Status: {status}")
            context_parts.append("")
        elif appointments:
            # If no next_appointment but appointments list exists, use first one
            appt = appointments[0]
            appt_date = appt.get('appointment_date', '')
            facility = appt.get('facility', '')
            appt_type = appt.get('appointment_type', '')
            try:
                from datetime import datetime
                appt_dt = datetime.fromisoformat(appt_date.replace('Z', '+00:00'))
                pretty_date = appt_dt.strftime("%B %d, %Y at %I:%M %p")
            except:
                pretty_date = appt_date
            context_parts.append("===== UPCOMING APPOINTMENT =====")
            context_parts.append(f"Date/Time: {pretty_date}")
            if facility:
                context_parts.append(f"Facility: {facility}")
            if appt_type:
                context_parts.append(f"Type: {appt_type}")
            context_parts.append("")
        
        # Add health timeline/vitals if available
        timeline = mother_context.get('timeline', [])
        if timeline:
            context_parts.append("===== RECENT HEALTH EVENTS & VITALS =====")
            recent_vitals = {}
            for event in timeline[:10]:  # Last 10 events
                event_type = event.get('event_type', '')
                event_date = event.get('event_date') or event.get('date', '')[:10]
                if event_type.lower() in ['vitals', 'checkup', 'lab']:
                    vitals_data = event.get('event_data') or event.get('data', {})
                    if isinstance(vitals_data, str):
                        try:
                            import json
                            vitals_data = json.loads(vitals_data)
                        except:
                            vitals_data = {}
                    if vitals_data:
                        for key, value in vitals_data.items():
                            if key.lower() in ['bp', 'blood_pressure', 'hb', 'hemoglobin', 'sugar', 'glucose', 'weight']:
                                recent_vitals[key] = value
            if recent_vitals:
                for key, value in recent_vitals.items():
                    context_parts.append(f"{key.replace('_', ' ').title()}: {value}")
            context_parts.append("")
        
        # Add medical reports with full details - combine all reports
        context_parts.append("===== MEDICAL REPORTS & DOCUMENTS =====")
        if reports_context:
            # Combine metrics from all reports
            all_metrics = {}
            all_concerns = []
            all_recommendations = []
            all_summaries = []
        
            for i, report in enumerate(reports_context[:10], start=1):  # Include up to 10 reports
                filename = report.get('file_name') or report.get('filename', f'Report {i}')
                summary = report.get('analysis_summary') or report.get('summary', '')
                uploaded_at = report.get('uploaded_at') or report.get('created_at', '')
                upload_date = uploaded_at[:10] if uploaded_at else 'N/A'
                
                context_parts.append(f"Report {i} ({upload_date}): {filename}")
                if summary:
                    context_parts.append(f"  Summary: {summary}")
                    all_summaries.append(f"{upload_date}: {summary}")
                
                # Extract health_metrics (can be JSON string or dict)
                health_metrics = report.get('health_metrics', {})
                if health_metrics:
                    if isinstance(health_metrics, str):
                        try:
                            import json
                            health_metrics = json.loads(health_metrics)
                        except:
                            health_metrics = {}
                    if isinstance(health_metrics, dict):
                        # Merge metrics from all reports (latest values take precedence)
                        for key, value in health_metrics.items():
                            if value is not None and value != "":
                                all_metrics[key] = value
                        if health_metrics:
                            context_parts.append(f"  Metrics: {health_metrics}")
                
                # Extract extracted_metrics (alternative column name)
                extracted_metrics = report.get('extracted_metrics', {})
                if extracted_metrics:
                    if isinstance(extracted_metrics, str):
                        try:
                            import json
                            extracted_metrics = json.loads(extracted_metrics)
                        except:
                            extracted_metrics = {}
                    if isinstance(extracted_metrics, dict):
                        for key, value in extracted_metrics.items():
                            if value is not None and value != "":
                                all_metrics[key] = value
                
                # Extract from analysis_result if available
                analysis_result = report.get('analysis_result', {})
                if analysis_result:
                    if isinstance(analysis_result, str):
                        try:
                            import json
                            analysis_result = json.loads(analysis_result)
                        except:
                            analysis_result = {}
                    if isinstance(analysis_result, dict):
                        # Extract extracted_data from analysis_result
                        extracted_data = analysis_result.get('extracted_data', {})
                        if extracted_data and isinstance(extracted_data, dict):
                            for key, value in extracted_data.items():
                                if value is not None and value != "":
                                    all_metrics[key] = value
                
                # Extract concerns
                concerns = report.get('concerns', [])
                if concerns:
                    if isinstance(concerns, str):
                        try:
                            import json
                            concerns = json.loads(concerns)
                        except:
                            concerns = []
                    if isinstance(concerns, list):
                        all_concerns.extend([c for c in concerns if c])
                    elif concerns:
                        all_concerns.append(str(concerns))
                    if concerns:
                        context_parts.append(f"  Concerns: {concerns if isinstance(concerns, list) else [concerns]}")
                
                # Extract recommendations
                recommendations = report.get('recommendations', [])
                if recommendations:
                    if isinstance(recommendations, str):
                        try:
                            import json
                            recommendations = json.loads(recommendations)
                        except:
                            recommendations = []
                    if isinstance(recommendations, list):
                        all_recommendations.extend([r for r in recommendations if r])
                    elif recommendations:
                        all_recommendations.append(str(recommendations))
                
                context_parts.append("")
            
            # Add combined summary of all reports
            if all_metrics:
                context_parts.append("===== COMBINED METRICS FROM ALL REPORTS =====")
                for key, value in all_metrics.items():
                    context_parts.append(f"{key.replace('_', ' ').title()}: {value}")
                context_parts.append("")
            
            if all_concerns:
                context_parts.append("===== COMBINED CONCERNS FROM ALL REPORTS =====")
                for concern in set(all_concerns):  # Remove duplicates
                    context_parts.append(f"⚠️ {concern}")
                context_parts.append("")
            
            if all_recommendations:
                context_parts.append("===== COMBINED RECOMMENDATIONS FROM ALL REPORTS =====")
                for rec in set(all_recommendations):  # Remove duplicates
                    context_parts.append(f"💡 {rec}")
                context_parts.append("")
        else:
            context_parts.append("No medical reports available yet.")
            context_parts.append("")
        
        # Add context memories (TOON summaries, concerns, facts)
        memories = mother_context.get('memories', [])
        if memories:
            context_parts.append("===== KEY HEALTH MEMORIES & CONCERNS =====")
            for mem in memories[:10]:  # Last 10 memories
                mem_key = mem.get('memory_key', '')
                mem_value = mem.get('memory_value', '')
                mem_type = mem.get('memory_type', '')
                if mem_value:
                    if mem_type == 'concern':
                        context_parts.append(f"⚠️ Concern: {mem_value}")
                    elif 'toon' in mem_key.lower():
                        context_parts.append(f"📋 Summary: {mem_value}")
                    else:
                        context_parts.append(f"💡 {mem_key}: {mem_value}")
            context_parts.append("")
        
        # Add any additional health metrics from context
        if mother_context.get('recent_bp'):
            context_parts.append(f"Recent Blood Pressure: {mother_context.get('recent_bp')}")
        if mother_context.get('recent_hb'):
            context_parts.append(f"Recent Hemoglobin: {mother_context.get('recent_hb')}")
        if mother_context.get('recent_sugar'):
            context_parts.append(f"Recent Blood Sugar: {mother_context.get('recent_sugar')}")
        
        return "\n".join(context_parts)
    
    async def process_query(
        self,
        query: str,
        mother_context: Dict[str, Any],
        reports_context: List[Dict[str, Any]]
    ) -> str:
        """Process a query and return response"""
        if not self.model:
            return (
                f"⚠️ {self.agent_name} is currently unavailable. "
                "Please try again later or contact support."
            )
        
        try:
            # Build full prompt
            system_prompt = self.get_system_prompt()
            context_info = self.build_context(mother_context, reports_context)
            preferred_language = mother_context.get('preferred_language', 'en')
            
            full_prompt = f"""
{system_prompt}

{context_info}

Language: {preferred_language}

User Question: {query}

Instructions:
- Provide a helpful, empathetic response
- Keep response concise (2-4 paragraphs)
- If urgent or concerning, strongly advise consulting healthcare provider
- Be specific and actionable
- Use simple, clear language
- Respond in the specified language above

Response:
"""
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            # Clean response
            cleaned_response = response.text.strip()
            
            logger.info(f"✅ {self.agent_name} processed query successfully")
            return cleaned_response
            
        except Exception as e:
            logger.error(f"❌ {self.agent_name} error: {e}")
            return (
                f"I apologize, but I encountered an issue processing your request. "
                f"Please try rephrasing your question or contact your healthcare provider if urgent."
            )