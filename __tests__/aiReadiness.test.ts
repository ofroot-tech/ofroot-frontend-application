import { calculateReadiness, readinessQuestions } from '@/app/lib/ai-readiness';

describe('AI agent readiness scoring', () => {
  it('keeps two equally weighted questions in each dimension', () => {
    const counts = readinessQuestions.reduce<Record<string, number>>((result, question) => {
      result[question.category] = (result[question.category] ?? 0) + 1;
      return result;
    }, {});

    expect(readinessQuestions).toHaveLength(12);
    expect(Object.values(counts)).toEqual([2, 2, 2, 2, 2, 2]);
  });

  it.each([
    [0, 0, 'Foundation required'],
    [1, 50, 'Pilot-ready with controls'],
    [2, 100, 'Ready to scale carefully'],
  ])('maps uniform answer %s to score %s', (answer, score, stage) => {
    const answers = Object.fromEntries(readinessQuestions.map(question => [question.id, answer]));
    const result = calculateReadiness(answers);

    expect(result.score).toBe(score);
    expect(result.stage).toBe(stage);
    expect(result.categoryScores.every(category => category.score === score)).toBe(true);
  });

  it('surfaces the three lowest dimensions as priorities', () => {
    const answers = Object.fromEntries(readinessQuestions.map(question => [question.id, 2]));
    for (const question of readinessQuestions.filter(item => ['Data', 'Controls', 'Operations'].includes(item.category))) {
      answers[question.id] = 0;
    }

    expect(calculateReadiness(answers).priorities).toEqual(['Data', 'Controls', 'Operations']);
  });
});
