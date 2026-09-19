import { Student, SmartUpdateCandidate } from '../types';

export function extractSmartUpdatesFromNotes(
  notesText: string,
  decisionsText: string,
  meetingId: string,
  student: Student
): SmartUpdateCandidate[] {
  const combinedText = `${notesText} \n ${decisionsText}`;
  const candidates: SmartUpdateCandidate[] = [];

  // 1. SAT Score Pattern
  // e.g. "SAT score is now 1450", "SAT is 1450", "scored 1540 on SAT", "SAT: 1450", "new SAT score of 1520"
  const satRegex = /(?:SAT(?:\s+score)?\s*(?:is|now|of|reached|scored|at|:)?\s*(\d{4}))|(?:scored\s*(\d{4})\s*(?:on|in)?\s*SAT)/i;
  const satMatch = combinedText.match(satRegex);
  if (satMatch) {
    const rawScore = satMatch[1] || satMatch[2];
    const scoreNum = parseInt(rawScore, 10);
    if (scoreNum >= 800 && scoreNum <= 1600) {
      const sentence = getSentenceAroundMatch(combinedText, rawScore);
      const currentScore = student.academics.satScore || 'None recorded';
      const hasConflict = !!student.academics.satScore && !student.academics.satScore.includes(rawScore);

      candidates.push({
        id: `cand-${Date.now()}-sat`,
        meetingId,
        fieldKey: 'academics.satScore',
        displayField: 'Student Profile > Academics & Testing > SAT Score',
        originalNoteQuote: sentence,
        proposedValue: rawScore,
        formattedProposedValue: `${rawScore} (Composite)`,
        currentValue: student.academics.satScore || '',
        formattedCurrentValue: currentScore,
        hasConflict,
        conflictReason: hasConflict
          ? `Current profile has SAT ${currentScore}. Note proposes new score of ${rawScore}. Requires confirmation to overwrite.`
          : undefined,
        status: 'Pending',
      });
    }
  }

  // 2. IELTS Score Pattern
  // e.g. "IELTS score is 8.0", "scored 8.5 on IELTS", "IELTS: 7.5", "IELTS is now 8.0"
  const ieltsRegex = /(?:IELTS(?:\s+score)?\s*(?:is|now|of|reached|scored|at|:)?\s*([6789]\.[05]))|(?:scored\s*([6789]\.[05])\s*(?:on|in)?\s*IELTS)/i;
  const ieltsMatch = combinedText.match(ieltsRegex);
  if (ieltsMatch) {
    const rawScore = ieltsMatch[1] || ieltsMatch[2];
    const sentence = getSentenceAroundMatch(combinedText, rawScore);
    const currentScore = student.academics.ieltsScore || 'None recorded';
    const hasConflict = !!student.academics.ieltsScore && !student.academics.ieltsScore.includes(rawScore);

    candidates.push({
      id: `cand-${Date.now()}-ielts`,
      meetingId,
      fieldKey: 'academics.ieltsScore',
      displayField: 'Student Profile > Academics & Testing > IELTS Band',
      originalNoteQuote: sentence,
      proposedValue: rawScore,
      formattedProposedValue: `Overall Band ${rawScore}`,
      currentValue: student.academics.ieltsScore || '',
      formattedCurrentValue: currentScore,
      hasConflict,
      conflictReason: hasConflict
        ? `Current profile lists IELTS ${currentScore}. Note indicates new score ${rawScore}.`
        : undefined,
      status: 'Pending',
    });
  }

  // 3. Financial Budget Pattern
  // e.g. "Family confirmed a $45,000 annual budget including housing", "budget is $50,000", "annual budget of $35,000"
  const budgetRegex = /(?:budget|contribution|financial\s*capacity)[\s\w]*?\$?([\d]{1,3}(?:,\d{3})+|\d{2,6})\s*(?:USD|\$|dollars)?/i;
  const budgetMatch = combinedText.match(budgetRegex);
  if (budgetMatch) {
    const rawBudgetStr = budgetMatch[1].replace(/,/g, '');
    const budgetNum = parseInt(rawBudgetStr, 10);
    if (budgetNum >= 5000 && budgetNum <= 120000) {
      const sentence = getSentenceAroundMatch(combinedText, budgetMatch[0]);
      const currentBudget = student.financials.estimatedAnnualBudgetUsd;
      const formattedCurrent = currentBudget ? `$${currentBudget.toLocaleString()} USD / year` : 'Not specified';
      const formattedProposed = `$${budgetNum.toLocaleString()} USD / year`;
      const hasConflict = currentBudget > 0 && currentBudget !== budgetNum;

      candidates.push({
        id: `cand-${Date.now()}-budget`,
        meetingId,
        fieldKey: 'financials.estimatedAnnualBudgetUsd',
        displayField: 'Student Profile > Family & Financial > Estimated Annual Budget',
        originalNoteQuote: sentence,
        proposedValue: budgetNum,
        formattedProposedValue: formattedProposed,
        currentValue: currentBudget,
        formattedCurrentValue: formattedCurrent,
        hasConflict,
        conflictReason: hasConflict
          ? `Current record is ${formattedCurrent}. Note updates budget to ${formattedProposed}. Will affect college list financial fit assessment.`
          : undefined,
        status: 'Pending',
      });
    }
  }

  // 4. Intended Major / Focus Direction Pattern
  // e.g. "Student decided to focus on Marketing", "decided to major in Computer Science", "switching focus to Economics"
  const majorPatterns = [
    /(?:decided\s+to\s+focus\s+on|wants\s+to\s+major\s+in|focus\s+on\s+majoring\s+in|agreed\s+on\s+major\s+of|switching\s+major\s+to|intended\s+major:\s*)([A-Za-z\s&/]+?)(?:\.|\n|,|;|$)/i,
  ];

  for (const pattern of majorPatterns) {
    const match = combinedText.match(pattern);
    if (match && match[1]) {
      const extractedMajor = cleanMajorString(match[1].trim());
      if (extractedMajor && extractedMajor.length > 2 && extractedMajor.length < 40) {
        const sentence = getSentenceAroundMatch(combinedText, match[0]);
        const currentMajors = student.interests.possibleMajors || [];
        const hasConflict = currentMajors.length > 0 && !currentMajors.some(m => m.toLowerCase() === extractedMajor.toLowerCase());

        candidates.push({
          id: `cand-${Date.now()}-major`,
          meetingId,
          fieldKey: 'interests.possibleMajors',
          displayField: 'Student Profile > Interests & Direction > Intended Major',
          originalNoteQuote: sentence,
          proposedValue: [extractedMajor, ...currentMajors.filter(m => m.toLowerCase() !== extractedMajor.toLowerCase())],
          formattedProposedValue: extractedMajor,
          currentValue: currentMajors,
          formattedCurrentValue: currentMajors.join(', ') || 'Undeclared',
          hasConflict,
          conflictReason: hasConflict
            ? `Current profile has [${currentMajors.join(', ')}]. Note signals new focus on [${extractedMajor}]. Verify if this replaces or adds to previous interests.`
            : undefined,
          status: 'Pending',
        });
        break; // take first definitive major match
      }
    }
  }

  // 5. GPA update pattern
  // e.g. "GPA is now 9.4/10", "Semester GPA 9.2 / 10.0", "updated GPA to 3.9/4.0"
  const gpaRegex = /(?:GPA|grade point average)[\s\w]*?(?:is|to|at|reached|now)?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*(?:10(?:\.0)?|4(?:\.0)?))?)/i;
  const gpaMatch = combinedText.match(gpaRegex);
  if (gpaMatch) {
    const rawGpa = gpaMatch[1].trim();
    const sentence = getSentenceAroundMatch(combinedText, gpaMatch[0]);
    const currentGpa = student.academics.gpa || 'Not recorded';
    const hasConflict = !!student.academics.gpa && !student.academics.gpa.startsWith(rawGpa.split('/')[0].trim());

    candidates.push({
      id: `cand-${Date.now()}-gpa`,
      meetingId,
      fieldKey: 'academics.gpa',
      displayField: 'Student Profile > Academics & Testing > GPA',
      originalNoteQuote: sentence,
      proposedValue: rawGpa.includes('/') ? rawGpa : `${rawGpa} / 10.0`,
      formattedProposedValue: rawGpa.includes('/') ? rawGpa : `${rawGpa} / 10.0`,
      currentValue: student.academics.gpa,
      formattedCurrentValue: currentGpa,
      hasConflict,
      conflictReason: hasConflict
        ? `Current profile records GPA ${currentGpa}. Note indicates ${rawGpa}.`
        : undefined,
      status: 'Pending',
    });
  }

  // 6. College List Addition Pattern
  // Look for known universities mentioned in the text that are not currently on the student's list
  const knownColleges = [
    { name: 'Bowdoin College', cat: 'Reach' },
    { name: 'Williams College', cat: 'Reach' },
    { name: 'Amherst College', cat: 'Reach' },
    { name: 'Swarthmore College', cat: 'Reach' },
    { name: 'Middlebury College', cat: 'Reach' },
    { name: 'Carleton College', cat: 'Reach' },
    { name: 'Colby College', cat: 'Target' },
    { name: 'Bates College', cat: 'Target' },
    { name: 'Cornell University', cat: 'Reach' },
    { name: 'Columbia University', cat: 'Reach' },
    { name: 'Harvard University', cat: 'Reach' },
    { name: 'New York University', cat: 'Reach' },
    { name: 'NYU', cat: 'Reach' },
    { name: 'Carnegie Mellon University', cat: 'Reach' },
    { name: 'Georgia Institute of Technology', cat: 'Reach' },
    { name: 'Purdue University', cat: 'Target' },
    { name: 'University of Richmond', cat: 'Target' },
    { name: 'Rhode Island School of Design', cat: 'Reach' },
    { name: 'RISD', cat: 'Reach' },
    { name: 'Syracuse University', cat: 'Target' },
    { name: 'Dickinson College', cat: 'Safety' },
    { name: 'Denison University', cat: 'Target' },
    { name: 'Drexel University', cat: 'Safety' },
  ];

  const collegeTriggerRegex = /(?:add(?:ing)?|apply(?:ing)?\s+to|consider(?:ing)?|list\s+includes?|agreed\s+on)\s+([A-Za-z\s&]+?)(?:\.|,|;|\n|$)/gi;
  let colMatch;
  while ((colMatch = collegeTriggerRegex.exec(combinedText)) !== null) {
    const textSnippet = colMatch[0];
    for (const college of knownColleges) {
      if (textSnippet.toLowerCase().includes(college.name.toLowerCase())) {
        const canonicalName = college.name === 'NYU' ? 'New York University' : college.name === 'RISD' ? 'Rhode Island School of Design' : college.name;
        const alreadyInList = student.collegePreferences.consideredColleges.some(
          c => c.name.toLowerCase() === canonicalName.toLowerCase()
        );
        if (!alreadyInList) {
          const sentence = getSentenceAroundMatch(combinedText, college.name);
          const candidateId = `cand-${Date.now()}-col-${canonicalName.replace(/\s+/g, '')}`;
          if (!candidates.some(c => c.proposedValue?.name === canonicalName)) {
            candidates.push({
              id: candidateId,
              meetingId,
              fieldKey: 'collegePreferences.consideredColleges',
              displayField: 'Student Profile > College Preferences > Add to Considered Colleges',
              originalNoteQuote: sentence,
              proposedValue: {
                id: `col-new-${Date.now()}`,
                name: canonicalName,
                category: college.cat,
                notes: `Added from meeting notes on ${new Date().toLocaleDateString()}`,
                financialFit: 'Needs Evaluation',
              },
              formattedProposedValue: `${canonicalName} (${college.cat})`,
              currentValue: student.collegePreferences.consideredColleges.map(c => c.name),
              formattedCurrentValue: `${student.collegePreferences.consideredColleges.length} colleges currently on list`,
              hasConflict: false,
              status: 'Pending',
            });
          }
        }
      }
    }
  }

  // 7. Next Milestone / Stage Recommendation
  const stageKeywords: Record<string, string> = {
    'early decision': 'Application & Essays',
    'common app': 'Application & Essays',
    'ed1': 'Application & Essays',
    'college list': 'College List & Strategy',
    'sat prep': 'Profile Building & Testing',
    'testing': 'Profile Building & Testing',
    'visa': 'Decision & Visa',
    'i-20': 'Decision & Visa',
  };

  for (const [kw, targetStage] of Object.entries(stageKeywords)) {
    if (combinedText.toLowerCase().includes(kw) && student.advisingStage !== targetStage) {
      // If note mentions something advancing the stage
      const sentence = getSentenceAroundMatch(combinedText, kw);
      if (!candidates.some(c => c.fieldKey === 'advisingStage')) {
        candidates.push({
          id: `cand-${Date.now()}-stage`,
          meetingId,
          fieldKey: 'advisingStage',
          displayField: 'Overview > Advising Stage',
          originalNoteQuote: sentence,
          proposedValue: targetStage,
          formattedProposedValue: targetStage,
          currentValue: student.advisingStage,
          formattedCurrentValue: student.advisingStage,
          hasConflict: true,
          conflictReason: `Current advising stage is "${student.advisingStage}". Note mentions key milestone pointing to "${targetStage}".`,
          status: 'Pending',
        });
      }
      break;
    }
  }

  return candidates;
}

function getSentenceAroundMatch(fullText: string, searchPhrase: string): string {
  const index = fullText.toLowerCase().indexOf(searchPhrase.toLowerCase());
  if (index === -1) return searchPhrase;
  const start = Math.max(0, fullText.lastIndexOf('.', index) + 1);
  let end = fullText.indexOf('.', index + searchPhrase.length);
  if (end === -1) end = fullText.length;
  const snippet = fullText.substring(start, end).trim();
  return snippet || searchPhrase;
}

function cleanMajorString(str: string): string {
  return str
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/\s+(as|in|for|and|with)\s*$/i, '')
    .trim();
}
