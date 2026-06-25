# backend/rag/medical_synonym.py

MEDICAL_SYNONYMS: dict[str, list[str]] = {
    "ज्वरो": ["fever", "pyrexia"],
    "fever": ["ज्वरो", "pyrexia"],
    "pyrexia": ["fever", "ज्वरो"],
    "टीबी": ["tuberculosis", "TB", "क्षयरोग"],
    "क्षयरोग": ["TB", "tuberculosis", "टीबी"],
    "tuberculosis": ["TB", "क्षयरोग", "टीबी"],
    "tb": ["tuberculosis", "क्षयरोग", "टीबी"],
    "डेंगु": ["dengue", "डेङ्गु"],
    "डेङ्गु": ["dengue", "डेंगु"],
    "dengue": ["डेङ्गु", "डेंगु"],
    "पखाला": ["diarrhea", "diarrhoea", "झाडापखाला"],
    "झाडापखाला": ["diarrhea", "diarrhoea", "पखाला"],
    "diarrhea": ["diarrhoea", "पखाला", "झाडापखाला"],
    "diarrhoea": ["diarrhea", "पखाला", "झाडापखाला"],
    "निमोनिया": ["pneumonia"],
    "pneumonia": ["निमोनिया"],
    "खोकी": ["cough"],
    "cough": ["खोकी"],
    "हैजा": ["cholera"],
    "cholera": ["हैजा"],
    "टाइफाइड": ["typhoid", "enteric fever"],
    "typhoid": ["टाइफाइड", "enteric fever"],
    "मलेरिया": ["malaria"],
    "malaria": ["मलेरिया"],
    "गर्भवती": ["pregnancy", "pregnant", "antenatal"],
    "pregnancy": ["गर्भवती", "गर्भावस्था"],
    "सुत्केरी": ["postpartum", "postnatal"],
    "postpartum": ["सुत्केरी", "postnatal"],
    "औषधि": ["medicine", "drug", "medication"],
    "medicine": ["औषधि", "drug", "medication"],
}


def expand_query(query: str, max_terms_per_match: int = 3) -> str:
    normalized = query.lower()
    additions: list[str] = []

    for term, synonyms in MEDICAL_SYNONYMS.items():
        if term.lower() in normalized:
            for synonym in synonyms[:max_terms_per_match]:
                if synonym.lower() not in normalized and synonym not in additions:
                    additions.append(synonym)

    if not additions:
        return query
    return f"{query} {' '.join(additions)}"
