/**
 * Tests for enhanced agent personas and admin system stats
 */
import { describe, it, expect } from 'vitest';
import { AGENT_PERSONAS, selectAgentPersona, buildPersonaSystemPrompt } from './ai/agentPersonas';

describe('Agent Personas', () => {
  it('should have all 8 required personas defined', () => {
    const requiredPersonas = [
      'citizen_explainer',
      'policymaker_brief',
      'donor_accountability',
      'bank_compliance',
      'research_librarian',
      'data_steward',
      'translation_agent',
      'scenario_modeler',
    ];
    for (const id of requiredPersonas) {
      expect(AGENT_PERSONAS[id]).toBeDefined();
      expect(AGENT_PERSONAS[id].id).toBe(id);
      expect(AGENT_PERSONAS[id].nameEn).toBeTruthy();
      expect(AGENT_PERSONAS[id].nameAr).toBeTruthy();
    }
  });

  it('should have expert knowledge in each persona system prompt', () => {
    // Each enhanced persona should contain "EXPERT KNOWLEDGE" or "CORE MISSION"
    for (const [id, persona] of Object.entries(AGENT_PERSONAS)) {
      expect(persona.systemPromptAddition).toContain('CORE MISSION');
      expect(persona.systemPromptAddition.length).toBeGreaterThan(200);
    }
  });

  it('bank_compliance should contain sanctions and CBY knowledge', () => {
    const banking = AGENT_PERSONAS.bank_compliance;
    expect(banking.systemPromptAddition).toContain('OFAC');
    expect(banking.systemPromptAddition).toContain('CBY');
    expect(banking.systemPromptAddition).toContain('sanctions');
    expect(banking.systemPromptAddition).toContain('compliance');
    expect(banking.systemPromptAddition).toContain('FATF');
  });

  it('citizen_explainer should contain GDP and remittance context', () => {
    const citizen = AGENT_PERSONAS.citizen_explainer;
    expect(citizen.systemPromptAddition).toContain('GDP');
    expect(citizen.systemPromptAddition).toContain('remittance');
    expect(citizen.systemPromptAddition).toContain('Rial');
  });

  it('policymaker_brief should contain fiscal and monetary policy knowledge', () => {
    const policy = AGENT_PERSONAS.policymaker_brief;
    expect(policy.systemPromptAddition).toContain('fiscal');
    expect(policy.systemPromptAddition).toContain('monetary');
    expect(policy.systemPromptAddition).toContain('exchange rate');
  });

  it('donor_accountability should contain OCHA and aid flow knowledge', () => {
    const donor = AGENT_PERSONAS.donor_accountability;
    expect(donor.systemPromptAddition).toContain('OCHA');
    expect(donor.systemPromptAddition).toContain('humanitarian');
    expect(donor.systemPromptAddition).toContain('DISBURSEMENT');
  });

  it('scenario_modeler should contain economic modeling knowledge', () => {
    const scenario = AGENT_PERSONAS.scenario_modeler;
    expect(scenario.systemPromptAddition).toContain('scenario');
    expect(scenario.systemPromptAddition).toContain('peace');
    expect(scenario.systemPromptAddition).toContain('oil price');
    expect(scenario.systemPromptAddition).toContain('reconstruction');
  });

  it('data_steward should contain confidence rating system', () => {
    const steward = AGENT_PERSONAS.data_steward;
    expect(steward.systemPromptAddition).toContain('Confidence Rating');
    expect(steward.systemPromptAddition).toContain('A (High)');
    expect(steward.systemPromptAddition).toContain('CSO');
  });

  it('translation_agent should contain Arabic economic terminology', () => {
    const translator = AGENT_PERSONAS.translation_agent;
    expect(translator.systemPromptAddition).toContain('البنك المركزي');
    expect(translator.systemPromptAddition).toContain('Exchange Rate');
    expect(translator.systemPromptAddition).toContain('Hawala');
  });

  it('research_librarian should contain source hierarchy', () => {
    const librarian = AGENT_PERSONAS.research_librarian;
    expect(librarian.systemPromptAddition).toContain('World Bank');
    expect(librarian.systemPromptAddition).toContain('IMF');
    expect(librarian.systemPromptAddition).toContain('TIER 1');
  });
});

describe('Agent Persona Selection', () => {
  it('should route banking page to bank_compliance', () => {
    const persona = selectAgentPersona({ page: 'banking' });
    expect(persona.id).toBe('bank_compliance');
  });

  it('should route humanitarian page to donor_accountability', () => {
    const persona = selectAgentPersona({ page: 'humanitarian' });
    expect(persona.id).toBe('donor_accountability');
  });

  it('should route scenario page to scenario_modeler', () => {
    const persona = selectAgentPersona({ page: 'scenario' });
    expect(persona.id).toBe('scenario_modeler');
  });

  it('should route translation queries to translation_agent', () => {
    const persona = selectAgentPersona({ query: 'translate this to Arabic' });
    expect(persona.id).toBe('translation_agent');
  });

  it('should route sanctions queries to bank_compliance', () => {
    const persona = selectAgentPersona({ query: 'OFAC sanctions list' });
    expect(persona.id).toBe('bank_compliance');
  });

  it('should route policy queries to policymaker_brief', () => {
    const persona = selectAgentPersona({ query: 'policy recommendations for CBY' });
    expect(persona.id).toBe('policymaker_brief');
  });

  it('should default to citizen_explainer for general queries', () => {
    const persona = selectAgentPersona({ query: 'what is happening with prices' });
    expect(persona.id).toBe('citizen_explainer');
  });
});

describe('Persona System Prompt Builder', () => {
  it('should build English system prompt correctly', () => {
    const persona = AGENT_PERSONAS.citizen_explainer;
    const prompt = buildPersonaSystemPrompt(persona, 'Base prompt here.', 'en');
    expect(prompt).toContain('Base prompt here.');
    expect(prompt).toContain('Citizen Explainer');
    expect(prompt).toContain('LANGUAGE INSTRUCTION');
    expect(prompt).toContain('English');
  });

  it('should build Arabic system prompt correctly', () => {
    const persona = AGENT_PERSONAS.citizen_explainer;
    const prompt = buildPersonaSystemPrompt(persona, 'Base prompt here.', 'ar');
    expect(prompt).toContain('المُفسِّر للمواطن');
    expect(prompt).toContain('Arabic');
    expect(prompt).toContain('العربية');
  });
});
