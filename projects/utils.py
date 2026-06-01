def analyze_complexity(text):
    """
    Простой анализ сложности по ключевым словам.
    Возвращает число от 1 до 10.
    """
    keywords = ['фронт', 'бэк', 'дизайн', 'верстка', 'база', 'api', 'интеграция', 'сложный', 'большой']
    score = sum(1 for kw in keywords if kw in text.lower())
    complexity = min(10, max(1, score))
    return complexity