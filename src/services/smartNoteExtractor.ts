import {
  Student,
  SmartUpdateCandidate,
  ExtracurricularItem,
  AwardItem,
  ConsideredCollege,
  TaskOwner,
  Meeting,
} from '../types';

export function extractSmartUpdatesFromNotes(
  notesText: string,
  decisionsText: string,
  actionItemsText: string,
  meetingId: string,
  student: Student,
  meetingMeta?: { date?: string; type?: string }
): SmartUpdateCandidate[] {
  const combinedText = `${notesText}\n${decisionsText}\n${actionItemsText}`;
  const candidates: SmartUpdateCandidate[] = [];
  const meetingDate = meetingMeta?.date || new Date().toISOString().split('T')[0];
  const meetingType = meetingMeta?.type || 'Advising Session';

  // Helper to check if a sentence/snippet expresses tentativeness or uncertainty
  const isHedging = (snippet: string): boolean => {
    const hedgeRegex = /\b(might|maybe|tentative|tentatively|considering|thinking\s+about|thinking\s+of|unsure|not\s+sure|not\s+final|exploring|undecided|pending|conflicted|provisional|possibility|could\s+be)\b/i;
    return hedgeRegex.test(snippet);
  };

  // Helper to extract a sentence containing the match
  const getSentence = (fullText: string, searchPhrase: string): string => {
    const index = fullText.toLowerCase().indexOf(searchPhrase.toLowerCase());
    if (index === -1) return searchPhrase;
    const start = Math.max(0, fullText.lastIndexOf('.', index) + 1);
    let end = fullText.indexOf('.', index + searchPhrase.length);
    if (end === -1) {
      end = fullText.indexOf('\n', index + searchPhrase.length);
      if (end === -1) end = fullText.length;
    }
    const snippet = fullText.substring(start, end).trim();
    return snippet || searchPhrase;
  };

  // -------------------------------------------------------------
  // 1. SAT SCORE
  // -------------------------------------------------------------
  const satRegex = /(?:SAT(?:\s+score)?\s*(?:is|now|of|reached|scored|at|:|composite)?\s*(\d{4}))|(?:scored\s*(\d{4})\s*(?:on|in)?\s*SAT)/i;
  const satMatch = combinedText.match(satRegex);
  if (satMatch) {
    const rawScore = satMatch[1] || satMatch[2];
    const scoreNum = parseInt(rawScore, 10);
    if (scoreNum >= 800 && scoreNum <= 1600) {
      const sentence = getSentence(combinedText, rawScore);
      const tentative = isHedging(sentence) || /aiming|target|goal|hopes?\s+to/i.test(sentence);
      const currentScore = student.academics.satScore || 'None recorded';
      const hasConflict = !!student.academics.satScore && !student.academics.satScore.includes(rawScore);

      candidates.push({
        id: `cand-${Date.now()}-sat`,
        meetingId,
        meetingDate,
        meetingType,
        category: 'testScore',
        fieldKey: 'academics.satScore',
        destinationSection: 'Academics & Testing > Standardized Tests',
        displayField: 'Student Profile > Academics & Testing > SAT Score',
        originalNoteQuote: sentence,
        proposedValue: rawScore,
        formattedProposedValue: `${rawScore} (Composite)`,
        currentValue: student.academics.satScore || '',
        formattedCurrentValue: currentScore,
        hasConflict,
        conflictReason: hasConflict
          ? `Current record has SAT ${currentScore}. Note proposes new score ${rawScore}. Requires confirmation to overwrite.`
          : undefined,
        isTentative: tentative,
        clarificationReason: tentative
          ? `Score mentioned tentatively or as an aspirational target. Verify official score report before confirming.`
          : undefined,
        status: 'Pending',
      });
    }
  }

  // -------------------------------------------------------------
  // 2. ACT SCORE
  // -------------------------------------------------------------
  const actRegex = /(?:ACT(?:\s+score)?\s*(?:is|now|of|reached|scored|at|:|composite)?\s*([1-3][0-9]))|(?:scored\s*([1-3][0-9])\s*(?:on|in)?\s*ACT)/i;
  const actMatch = combinedText.match(actRegex);
  if (actMatch) {
    const rawScore = actMatch[1] || actMatch[2];
    const scoreNum = parseInt(rawScore, 10);
    if (scoreNum >= 12 && scoreNum <= 36) {
      const sentence = getSentence(combinedText, actMatch[0]);
      const tentative = isHedging(sentence);
      const currentScore = student.academics.actScore || 'None recorded';
      const hasConflict = !!student.academics.actScore && !student.academics.actScore.includes(rawScore);

      candidates.push({
        id: `cand-${Date.now()}-act`,
        meetingId,
        meetingDate,
        meetingType,
        category: 'testScore',
        fieldKey: 'academics.actScore',
        destinationSection: 'Academics & Testing > Standardized Tests',
        displayField: 'Student Profile > Academics & Testing > ACT Composite',
        originalNoteQuote: sentence,
        proposedValue: rawScore,
        formattedProposedValue: `${rawScore} (Composite)`,
        currentValue: student.academics.actScore || '',
        formattedCurrentValue: currentScore,
        hasConflict,
        conflictReason: hasConflict
          ? `Current profile lists ACT ${currentScore}. Note indicates score ${rawScore}.`
          : undefined,
        isTentative: tentative,
        clarificationReason: tentative
          ? `ACT score mentioned tentatively. Needs official report verification.`
          : undefined,
        status: 'Pending',
      });
    }
  }

  // -------------------------------------------------------------
  // 3. IELTS SCORE
  // -------------------------------------------------------------
  const ieltsRegex = /(?:IELTS(?:\s+score)?\s*(?:is|now|of|reached|scored|at|:)?\s*([5-9]\.[05]))|(?:scored\s*([5-9]\.[05])\s*(?:on|in)?\s*IELTS)/i;
  const ieltsMatch = combinedText.match(ieltsRegex);
  if (ieltsMatch) {
    const rawScore = ieltsMatch[1] || ieltsMatch[2];
    const sentence = getSentence(combinedText, rawScore);
    const tentative = isHedging(sentence);
    const currentScore = student.academics.ieltsScore || 'None recorded';
    const hasConflict = !!student.academics.ieltsScore && !student.academics.ieltsScore.includes(rawScore);

    candidates.push({
      id: `cand-${Date.now()}-ielts`,
      meetingId,
      meetingDate,
      meetingType,
      category: 'testScore',
      fieldKey: 'academics.ieltsScore',
      destinationSection: 'Academics & Testing > Standardized Tests',
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
      isTentative: tentative,
      clarificationReason: tentative
        ? `IELTS band mentioned with uncertainty. Needs TRF certificate verification.`
        : undefined,
      status: 'Pending',
    });
  }

  // -------------------------------------------------------------
  // 4. TOEFL SCORE
  // -------------------------------------------------------------
  const toeflRegex = /(?:TOEFL(?:\s+score)?\s*(?:is|now|of|reached|scored|at|:)?\s*(\d{2,3}))/i;
  const toeflMatch = combinedText.match(toeflRegex);
  if (toeflMatch) {
    const rawScore = toeflMatch[1];
    const num = parseInt(rawScore, 10);
    if (num >= 60 && num <= 120) {
      const sentence = getSentence(combinedText, toeflMatch[0]);
      const tentative = isHedging(sentence);
      const currentScore = student.academics.toeflScore || 'None recorded';
      const hasConflict = !!student.academics.toeflScore && student.academics.toeflScore !== rawScore;

      candidates.push({
        id: `cand-${Date.now()}-toefl`,
        meetingId,
        meetingDate,
        meetingType,
        category: 'testScore',
        fieldKey: 'academics.toeflScore',
        destinationSection: 'Academics & Testing > Standardized Tests',
        displayField: 'Student Profile > Academics & Testing > TOEFL iBT',
        originalNoteQuote: sentence,
        proposedValue: rawScore,
        formattedProposedValue: `${rawScore} / 120`,
        currentValue: student.academics.toeflScore || '',
        formattedCurrentValue: currentScore,
        hasConflict,
        conflictReason: hasConflict
          ? `Current profile lists TOEFL ${currentScore}. Note indicates ${rawScore}.`
          : undefined,
        isTentative: tentative,
        status: 'Pending',
      });
    }
  }

  // -------------------------------------------------------------
  // 5. GPA UPDATE
  // -------------------------------------------------------------
  const gpaRegex = /(?:GPA|grade point average)[\s\w]*?(?:is|to|at|reached|now|updated\s+to)?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*(?:10(?:\.0)?|4(?:\.0)?))?)/i;
  const gpaMatch = combinedText.match(gpaRegex);
  if (gpaMatch) {
    const rawGpa = gpaMatch[1].trim();
    const sentence = getSentence(combinedText, gpaMatch[0]);
    const currentGpa = student.academics.gpa || 'Not recorded';
    const tentative = isHedging(sentence);
    const hasConflict = !!student.academics.gpa && !student.academics.gpa.startsWith(rawGpa.split('/')[0].trim());

    candidates.push({
      id: `cand-${Date.now()}-gpa`,
      meetingId,
      meetingDate,
      meetingType,
      category: 'testScore',
      fieldKey: 'academics.gpa',
      destinationSection: 'Academics & Testing > GPA & Schooling',
      displayField: 'Student Profile > Academics & Testing > GPA',
      originalNoteQuote: sentence,
      proposedValue: rawGpa.includes('/') ? rawGpa : `${rawGpa} / 10.0`,
      formattedProposedValue: rawGpa.includes('/') ? rawGpa : `${rawGpa} / 10.0`,
      currentValue: student.academics.gpa,
      formattedCurrentValue: currentGpa,
      hasConflict,
      conflictReason: hasConflict
        ? `Current profile records GPA ${currentGpa}. Note indicates updated GPA ${rawGpa}.`
        : undefined,
      isTentative: tentative,
      clarificationReason: tentative ? 'GPA reported tentatively before official semester transcript.' : undefined,
      status: 'Pending',
    });
  }

  // -------------------------------------------------------------
  // 6. INTENDED MAJOR / ACADEMIC DIRECTION
  // -------------------------------------------------------------
  const majorPhrases = [
    // 1. Phrased interests: "is becoming more interested in", "more interested in", "interested in", "interest in", "wants to major in", etc.
    /(?:is\s+)?(?:becoming\s+(?:more\s+)?interested\s+in|more\s+interested\s+in|interested\s+in|interest\s+in|expressed\s+interest\s+in|leaning\s+towards|gravitating\s+towards|plans?\s+to\s+study|wants\s+to\s+study|decided\s+to\s+focus\s+on|wants\s+to\s+major\s+in|focus\s+on\s+majoring\s+in|agreed\s+on\s+major\s+of|switching\s+major\s+to|intended\s+major(?:\s*is)?:\s*|major\s+interest:\s*|strong\s+interest\s+in\s+majoring\s+in|interested\s+in\s+studying|plans\s+to\s+major\s+in|focusing\s+on|considering\s+majoring\s+in|exploring\s+majors?\s+in|considering)\s+([A-Za-z\s&/\-]{3,40}?)(?=[,.;\n]|(?:\s+(?:that|and\s+that|with|which|while|pending|confirmed|family|including|before|after|or)\b)|$)/i,
    // 2. Direct declarations: "intended major: Marketing", "major: Marketing"
    /(?:intended\s+major|target\s+major|prospective\s+major|primary\s+major)[\s:]+([A-Za-z\s&/\-]{3,40}?)(?=[,.;\n]|$)/i,
  ];

  const POPULAR_MAJORS = [
    'Marketing',
    'Business',
    'Business Administration',
    'Finance',
    'Economics',
    'Accounting',
    'Computer Science',
    'Computer Science & Artificial Intelligence',
    'Computer Science & AI',
    'Artificial Intelligence',
    'Data Science',
    'Software Engineering',
    'Information Technology',
    'Biology',
    'Biological Sciences',
    'Biochemistry',
    'Biomedical Engineering',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Applied Mathematics',
    'Statistics',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Environmental Science',
    'Environmental Studies',
    'Psychology',
    'Neuroscience',
    'Cognitive Science',
    'Communications',
    'Media Studies',
    'Journalism',
    'Political Science',
    'International Relations',
    'Public Policy',
    'Government',
    'History',
    'Philosophy',
    'English',
    'Literature',
    'Sociology',
    'Anthropology',
    'Architecture',
    'Graphic Design',
    'Fine Arts',
    'Studio Art',
    'Music',
    'Film Studies',
    'Education',
  ];

  let detectedMajor: string | null = null;
  let majorMatchSnippet = '';

  for (const pattern of majorPhrases) {
    const match = combinedText.match(pattern);
    if (match && match[1]) {
      const cleaned = cleanMajorString(match[1]);
      if (
        cleaned &&
        cleaned.length >= 3 &&
        !/^(the|a|an|very|much|her|his|their|student|diagnostic|sat|act|test)$/i.test(cleaned)
      ) {
        detectedMajor = cleaned;
        majorMatchSnippet = match[0];
        break;
      }
    }
  }

  // Also check if any popular major name is directly mentioned with interest intent
  if (!detectedMajor) {
    for (const popMajor of POPULAR_MAJORS) {
      const popRegex = new RegExp(`(?:interest(?:ed)?\\s+in|study|major(?:ing)?\\s+in|focus(?:ing)?\\s+on)\\s+${popMajor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (popRegex.test(combinedText)) {
        detectedMajor = popMajor;
        majorMatchSnippet = popMajor;
        break;
      }
    }
  }

  if (detectedMajor) {
    const sentence = getSentence(combinedText, majorMatchSnippet || detectedMajor);
    const tentative = isHedging(sentence) || /considering|exploring|undecided|thinking/i.test(sentence);
    const currentMajors = student.interests.possibleMajors || [];
    const hasConflict =
      currentMajors.length > 0 &&
      !currentMajors.some((m) => m.toLowerCase() === detectedMajor!.toLowerCase());

    candidates.push({
      id: `cand-${Date.now()}-major`,
      meetingId,
      meetingDate,
      meetingType,
      category: 'major',
      fieldKey: 'interests.possibleMajors',
      destinationSection: 'Interests & Direction > Academic Majors',
      displayField: 'Student Profile > Interests & Direction > Intended Major',
      originalNoteQuote: sentence,
      proposedValue: [
        detectedMajor,
        ...currentMajors.filter((m) => m.toLowerCase() !== detectedMajor!.toLowerCase()),
      ],
      formattedProposedValue: detectedMajor,
      currentValue: currentMajors,
      formattedCurrentValue: currentMajors.join(', ') || 'Undeclared',
      hasConflict,
      conflictReason: hasConflict
        ? `Current profile has [${currentMajors.join(', ')}]. Note signals new interest in [${detectedMajor}]. Verify if this replaces or adds to existing list.`
        : undefined,
      isTentative: tentative,
      clarificationReason: tentative
        ? `Student expressed tentative exploratory interest ('${detectedMajor}') rather than confirmed commitment. Labeled for clarification.`
        : undefined,
      status: 'Pending',
    });
  }

  // -------------------------------------------------------------
  // 7. FINANCIAL BUDGET
  // -------------------------------------------------------------
  const budgetPatterns = [
    // Pattern 1: $35,000 annual budget / $35,000 per year budget / $35,000 family contribution
    /\$?\s*([\d]{1,3}(?:,\d{3})+|\d{2,6})(?:\s*k|\s*thousand)?\s*(?:(?:USD|dollars)\s*)?(?:annual(?:ly)?|per\s+year|\/year)?\s*(?:family\s+contribution|annual\s+budget|budget|contribution|financial\s+capacity|annual\s+family\s+budget)/i,
    // Pattern 2: budget / capacity / contribution of $35,000
    /(?:budget|contribution|financial\s*capacity|annual\s*capacity|annual\s*budget|family\s*budget|tuition\s*budget|cost\s*limit|financial\s*aid\s*limit)[\s\w]*?\$?\s*([\d]{1,3}(?:,\d{3})+|\d{2,6})(?:\s*k|\s*thousand)?\s*(?:USD|\$|dollars)?/i,
    // Pattern 3: family / parents confirmed $35,000 / can afford $35,000
    /(?:family|parents)\s+(?:confirmed|agreed|can\s+afford|set|stated|committed\s+to|indicated)[\s\w]*?\$?\s*([\d]{1,3}(?:,\d{3})+|\d{2,6})(?:\s*k|\s*thousand)?\s*(?:(?:USD|\$|dollars)\s*)?(?:annual(?:ly)?|per\s+year|\/year|annual\s+budget|budget)?/i,
    // Pattern 4: $35,000 including tuition and living expenses
    /\$?\s*([\d]{1,3}(?:,\d{3})+|\d{2,6})(?:\s*k|\s*thousand)?\s*(?:USD|\$|dollars)?[\s\w]*?(?:annual\s+budget|including\s+tuition)/i,
  ];

  let detectedBudget: number | null = null;
  let budgetMatchSnippet = '';

  for (const pattern of budgetPatterns) {
    const bMatch = combinedText.match(pattern);
    if (bMatch && bMatch[1]) {
      const rawVal = bMatch[1].replace(/,/g, '');
      let parsed = parseInt(rawVal, 10);
      if (/k|thousand/i.test(bMatch[0]) && parsed < 1000) {
        parsed = parsed * 1000;
      }
      if (parsed >= 5000 && parsed <= 200000) {
        detectedBudget = parsed;
        budgetMatchSnippet = bMatch[0];
        break;
      }
    }
  }

  if (detectedBudget !== null) {
    const sentence = getSentence(combinedText, budgetMatchSnippet || `$${detectedBudget.toLocaleString()}`);
    const tentative = isHedging(sentence) && !/confirmed|agreed|locked|set/i.test(sentence);
    const currentBudget = student.financials.estimatedAnnualBudgetUsd;
    const formattedCurrent = currentBudget ? `$${currentBudget.toLocaleString()} USD / year` : 'Not specified';
    const formattedProposed = `$${detectedBudget.toLocaleString()} USD / year`;
    const hasConflict = currentBudget > 0 && currentBudget !== detectedBudget;

    candidates.push({
      id: `cand-${Date.now()}-budget`,
      meetingId,
      meetingDate,
      meetingType,
      category: 'budget',
      fieldKey: 'financials.estimatedAnnualBudgetUsd',
      destinationSection: 'Family & Financial > Estimated Annual Budget',
      displayField: 'Student Profile > Family & Financial > Annual Budget (USD)',
      originalNoteQuote: sentence,
      proposedValue: detectedBudget,
      formattedProposedValue: formattedProposed,
      currentValue: currentBudget,
      formattedCurrentValue: formattedCurrent,
      hasConflict,
      conflictReason: hasConflict
        ? `Current record has budget ${formattedCurrent}. Note proposes ${formattedProposed}. Will recalibrate college list financial feasibility.`
        : undefined,
      isTentative: tentative,
      clarificationReason: tentative
        ? `Financial contribution stated tentatively or pending consultation with family. Labeled for clarification.`
        : undefined,
      status: 'Pending',
    });
  }

  // -------------------------------------------------------------
  // 8. EXTRACURRICULAR ACTIVITY
  // -------------------------------------------------------------
  const activityRegex = /(?:activity:|extracurricular:|joined|founded|co-founded|started|elected|leads?|president\s+of|serves\s+as)[\s:]+([^.\n;]+)/i;
  const activityMatch = combinedText.match(activityRegex);
  if (activityMatch && activityMatch[1]) {
    const snippet = activityMatch[1].trim();
    if (snippet.length >= 10 && !/^(the|a|an)$/i.test(snippet)) {
      const sentence = getSentence(combinedText, activityMatch[0]);
      const tentative = isHedging(sentence) || /considering\s+joining|thinking\s+about/i.test(sentence);

      // Parse hours if present
      const hoursMatch = sentence.match(/(\d+(?:-\d+)?)\s*(?:hours?|hrs?)(?:\s*(?:per|\/)\s*week)?/i);
      const hours = hoursMatch ? `${hoursMatch[1]} hrs/week` : '4 hrs/week';

      // Infer title and role
      let role = 'Member / Contributor';
      if (/president/i.test(sentence)) role = 'President';
      else if (/founder|co-founder/i.test(sentence)) role = 'Founder & Lead';
      else if (/lead|leader|director/i.test(sentence)) role = 'Team Lead';
      else if (/vice\s*president/i.test(sentence)) role = 'Vice President';

      const title = snippet.split(',')[0].replace(/^(a|an|the)\s+/i, '').trim();

      const newActivity: ExtracurricularItem = {
        id: `ec-${Date.now()}`,
        title: title.length > 50 ? title.substring(0, 50) : title,
        role,
        organization: student.basic.school || 'School & Community',
        hoursPerWeek: hours,
        weeksPerYear: '30 weeks/year',
        description: sentence,
        status: tentative ? 'Needs Clarification' : 'Advisor-Verified',
      };

      candidates.push({
        id: `cand-${Date.now()}-activity`,
        meetingId,
        meetingDate,
        meetingType,
        category: 'activity',
        fieldKey: 'activities.extracurriculars',
        destinationSection: 'Activities & Honors > Extracurriculars',
        displayField: 'Student Profile > Activities > Add Extracurricular Activity',
        originalNoteQuote: sentence,
        proposedValue: newActivity,
        formattedProposedValue: `${newActivity.title} (${newActivity.role}, ${hours})`,
        currentValue: student.activities.extracurriculars.length,
        formattedCurrentValue: `${student.activities.extracurriculars.length} activities currently recorded`,
        hasConflict: false,
        isTentative: tentative,
        clarificationReason: tentative
          ? `Activity mentioned as tentative or exploratory idea. Needs confirmation of actual hours and enrollment.`
          : undefined,
        status: 'Pending',
      });
    }
  }

  // -------------------------------------------------------------
  // 9. AWARD / HONOR
  // -------------------------------------------------------------
  const awardRegex = /(?:award:|honor:|won|received|awarded|achieved|placed\s+(?:1st|2nd|3rd|first|second|third))[\s:]+([^.\n;]+)/i;
  const awardMatch = combinedText.match(awardRegex);
  if (awardMatch && awardMatch[1]) {
    const rawAward = awardMatch[1].trim();
    if (rawAward.length >= 8 && !/^(the|a|an)$/i.test(rawAward)) {
      const sentence = getSentence(combinedText, awardMatch[0]);
      const tentative = isHedging(sentence);

      let level: 'School' | 'City/Province' | 'National' | 'International' = 'City/Province';
      if (/national/i.test(sentence) || /olympiad/i.test(sentence)) level = 'National';
      else if (/international|global|world/i.test(sentence)) level = 'International';
      else if (/school|class|intra/i.test(sentence)) level = 'School';

      const yearMatch = sentence.match(/\b(202[4-7])\b/);
      const awardYear = yearMatch ? yearMatch[1] : String(new Date().getFullYear());

      const newAward: AwardItem = {
        id: `awd-${Date.now()}`,
        title: rawAward.length > 55 ? rawAward.substring(0, 55) : rawAward,
        level,
        year: awardYear,
        description: sentence,
        status: tentative ? 'Needs Clarification' : 'Advisor-Verified',
      };

      candidates.push({
        id: `cand-${Date.now()}-award`,
        meetingId,
        meetingDate,
        meetingType,
        category: 'award',
        fieldKey: 'activities.awards',
        destinationSection: 'Activities & Honors > Awards & Honors',
        displayField: 'Student Profile > Activities > Add Award / Honor',
        originalNoteQuote: sentence,
        proposedValue: newAward,
        formattedProposedValue: `${newAward.title} (${level}, ${awardYear})`,
        currentValue: student.activities.awards.length,
        formattedCurrentValue: `${student.activities.awards.length} awards currently recorded`,
        hasConflict: false,
        isTentative: tentative,
        clarificationReason: tentative
          ? `Award or competition outcome is pending final results announcement.`
          : undefined,
        status: 'Pending',
      });
    }
  }

  // -------------------------------------------------------------
  // 10. COLLEGE PREFERENCES & LIST ADDITIONS
  // -------------------------------------------------------------
  const richColleges = [
    { name: 'Bowdoin College', cat: 'Reach' as const },
    { name: 'Williams College', cat: 'Reach' as const },
    { name: 'Amherst College', cat: 'Reach' as const },
    { name: 'Swarthmore College', cat: 'Reach' as const },
    { name: 'Middlebury College', cat: 'Reach' as const },
    { name: 'Carleton College', cat: 'Reach' as const },
    { name: 'Colby College', cat: 'Target' as const },
    { name: 'Bates College', cat: 'Target' as const },
    { name: 'Swarthmore', cat: 'Reach' as const },
    { name: 'Cornell University', cat: 'Reach' as const },
    { name: 'Columbia University', cat: 'Reach' as const },
    { name: 'Harvard University', cat: 'Reach' as const },
    { name: 'Yale University', cat: 'Reach' as const },
    { name: 'Princeton University', cat: 'Reach' as const },
    { name: 'Stanford University', cat: 'Reach' as const },
    { name: 'MIT', cat: 'Reach' as const },
    { name: 'Duke University', cat: 'Reach' as const },
    { name: 'Northwestern University', cat: 'Reach' as const },
    { name: 'Johns Hopkins University', cat: 'Reach' as const },
    { name: 'Brown University', cat: 'Reach' as const },
    { name: 'Dartmouth College', cat: 'Reach' as const },
    { name: 'New York University', cat: 'Reach' as const },
    { name: 'NYU', cat: 'Reach' as const },
    { name: 'Carnegie Mellon University', cat: 'Reach' as const },
    { name: 'Georgia Institute of Technology', cat: 'Reach' as const },
    { name: 'Georgia Tech', cat: 'Reach' as const },
    { name: 'Purdue University', cat: 'Target' as const },
    { name: 'University of Richmond', cat: 'Target' as const },
    { name: 'Rhode Island School of Design', cat: 'Reach' as const },
    { name: 'RISD', cat: 'Reach' as const },
    { name: 'Syracuse University', cat: 'Target' as const },
    { name: 'Dickinson College', cat: 'Safety' as const },
    { name: 'Denison University', cat: 'Target' as const },
    { name: 'Drexel University', cat: 'Safety' as const },
    { name: 'Boston University', cat: 'Target' as const },
    { name: 'Boston College', cat: 'Target' as const },
    { name: 'Tufts University', cat: 'Reach' as const },
    { name: 'University of Michigan', cat: 'Reach' as const },
    { name: 'UIUC', cat: 'Target' as const },
    { name: 'University of Virginia', cat: 'Reach' as const },
    { name: 'UNC Chapel Hill', cat: 'Reach' as const },
    { name: 'University of Rochester', cat: 'Target' as const },
    { name: 'Case Western Reserve University', cat: 'Target' as const },
    { name: 'Babson College', cat: 'Target' as const },
    { name: 'Davidson College', cat: 'Reach' as const },
    { name: 'Haverford College', cat: 'Reach' as const },
  ];

  for (const college of richColleges) {
    const regex = new RegExp(`\\b${college.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(combinedText)) {
      const canonicalName =
        college.name === 'NYU'
          ? 'New York University'
          : college.name === 'RISD'
          ? 'Rhode Island School of Design'
          : college.name === 'MIT'
          ? 'Massachusetts Institute of Technology'
          : college.name === 'Georgia Tech'
          ? 'Georgia Institute of Technology'
          : college.name;

      const alreadyInList = student.collegePreferences.consideredColleges.some(
        (c) => c.name.toLowerCase() === canonicalName.toLowerCase()
      );

      if (!alreadyInList && !candidates.some((c) => c.fieldKey === 'collegePreferences.consideredColleges' && c.proposedValue?.name === canonicalName)) {
        const sentence = getSentence(combinedText, college.name);
        const tentative = isHedging(sentence) || /considering|thinking|look\s+into/i.test(sentence);

        const newCollege: ConsideredCollege = {
          id: `col-${Date.now()}-${canonicalName.replace(/\s+/g, '')}`,
          name: canonicalName,
          category: college.cat,
          notes: `Extracted from meeting note on ${meetingDate}`,
          financialFit: 'Needs Evaluation',
          location: 'US',
        };

        candidates.push({
          id: `cand-${Date.now()}-col-${canonicalName.replace(/\s+/g, '')}`,
          meetingId,
          meetingDate,
          meetingType,
          category: 'college',
          fieldKey: 'collegePreferences.consideredColleges',
          destinationSection: 'College Preferences > Considered Colleges',
          displayField: 'Student Profile > College List > Add Considered College',
          originalNoteQuote: sentence,
          proposedValue: newCollege,
          formattedProposedValue: `${canonicalName} (${college.cat})`,
          currentValue: student.collegePreferences.consideredColleges.length,
          formattedCurrentValue: `${student.collegePreferences.consideredColleges.length} colleges currently on list`,
          hasConflict: false,
          isTentative: tentative,
          clarificationReason: tentative
            ? `College mentioned tentatively ('${canonicalName}'). Marked for clarification before committing to strategy list.`
            : undefined,
          status: 'Pending',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 11. DEADLINE / NEXT MAJOR MILESTONE
  // -------------------------------------------------------------
  const deadlineRegex = /(?:deadline(?:\s+is)?|milestone(?:\s+is)?|due\s+date(?:\s+is)?)[\s:]+([^.\n;]+)/i;
  const deadlineMatch = combinedText.match(deadlineRegex);
  if (deadlineMatch && deadlineMatch[1]) {
    const rawDeadline = deadlineMatch[1].trim();
    if (rawDeadline.length >= 6 && rawDeadline.length <= 80) {
      const sentence = getSentence(combinedText, deadlineMatch[0]);
      const tentative = isHedging(sentence);
      const currentMilestone = student.nextMilestone || 'None set';
      const hasConflict = currentMilestone !== rawDeadline;

      candidates.push({
        id: `cand-${Date.now()}-deadline`,
        meetingId,
        meetingDate,
        meetingType,
        category: 'deadline',
        fieldKey: 'nextMilestone',
        destinationSection: 'Overview > Next Major Milestone',
        displayField: 'Overview > Next Major Milestone',
        originalNoteQuote: sentence,
        proposedValue: rawDeadline,
        formattedProposedValue: rawDeadline,
        currentValue: currentMilestone,
        formattedCurrentValue: currentMilestone,
        hasConflict,
        conflictReason: hasConflict
          ? `Current milestone is "${currentMilestone}". Note sets new target: "${rawDeadline}".`
          : undefined,
        isTentative: tentative,
        clarificationReason: tentative ? 'Deadline stated as tentative.' : undefined,
        status: 'Pending',
      });
    }
  }

  // -------------------------------------------------------------
  // 12. TASKS / ACTION ITEMS
  // -------------------------------------------------------------
  // Parse lines from actionItemsText or sentences in discussion notes and decisions
  const taskSources: string[] = [];

  if (actionItemsText.trim()) {
    const lines = actionItemsText.split(/\n|;/).map((l) => l.trim()).filter((l) => l.length > 5);
    taskSources.push(...lines);
  }

  // Student name keywords for recognizing commitments in third person
  const studentKeywords = [
    'student',
    'she',
    'he',
    'they',
    student.basic.name,
    student.basic.preferredName?.replace(/\(.*?\)/g, '').trim(),
    ...student.basic.name.split(' '),
  ]
    .filter(Boolean)
    .map((k) => k!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const studentNamePattern = Array.from(new Set(studentKeywords)).join('|');

  // Also scan combinedText for sentences with task triggers
  const taskSentenceTriggers = [
    // 1. Student commitments: "[she/he/student/Minh Anh] will/needs to/must/is to/agreed to complete..."
    new RegExp(
      `(?:(?:${studentNamePattern})\\s+(?:will|needs?\\s+to|must|is\\s+to|plans?\\s+to|agreed\\s+to|committed\\s+to|scheduled\\s+to|should))\\s+([^.\\n;]+)`,
      'gi'
    ),
    // 2. Advisor commitments: "advisor/counselor will/needs to/must/to..."
    /(?:advisor|counselor|lead\s+advisor)\s+(?:will|needs?\s+to|must|is\s+to|plans?\s+to|agreed\s+to|committed\s+to)\s+([^.\n;]+)/gi,
    // 3. Explicit labels: "action item:", "task:", "todo:", "next step:", "deliverable:"
    /(?:action\s*item:?|task:?|todo:?|deliverable:?|next\s*step:?)\s+([^.\n;]+)/gi,
    // 4. Standalone commitment phrases: "will complete/take/submit/draft/prepare/review/research..."
    /(?:will|to)\s+(?:complete|take|submit|draft|prepare|finalize|send|review|research|schedule|register\s+for)\s+([^.\n;]+)/gi,
  ];

  for (const trigger of taskSentenceTriggers) {
    let tMatch;
    while ((tMatch = trigger.exec(combinedText)) !== null) {
      if (tMatch[0] && tMatch[0].length > 8) {
        taskSources.push(tMatch[0].trim());
      }
    }
  }

  // Deduplicate and process task sources (limit to top 4 tasks max per meeting note)
  const uniqueTasks = Array.from(new Set(taskSources)).slice(0, 4);
  const seenTaskTitles = new Set<string>();

  uniqueTasks.forEach((itemText, idx) => {
    // Determine owner
    let owner: TaskOwner = 'Student';
    if (/advisor|counselor/i.test(itemText)) {
      owner = 'Advisor';
    } else if (/parent|mother|father|family/i.test(itemText)) {
      owner = 'Parent';
    }

    // Determine due date if mentioned
    let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (/next\s+meeting|next\s+session|upcoming\s+meeting/i.test(itemText)) {
      dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else {
      const dateMatch = itemText.match(
        /(?:by|before|prior\s+to|due)\s+([A-Za-z]+\s+\d{1,2}|\d{1,2}\/\d{1,2}|next\s+[A-Za-z]+|friday|monday)/i
      );
      if (dateMatch) {
        const textDate = dateMatch[0].replace(/^(?:by|before|prior\s+to|due)\s+/i, '');
        if (/friday/i.test(textDate)) {
          const nextFri = getNextDayOfWeek(5);
          dueDate = nextFri.toISOString().split('T')[0];
        } else if (/monday/i.test(textDate)) {
          const nextMon = getNextDayOfWeek(1);
          dueDate = nextMon.toISOString().split('T')[0];
        }
      }
    }

    // Clean task title
    let cleanTitle = itemText
      .replace(/^(?:and\s+that\s+|that\s+)?/i, '')
      .replace(new RegExp(`^(?:(?:${studentNamePattern})\\s+(?:will|needs?\\s+to|must|is\\s+to|plans?\\s+to|agreed\\s+to|to))\\s*`, 'i'), '')
      .replace(/^(?:advisor|counselor)\s+(?:will|needs?\\s+to|must|is\\s+to|to)\s*/i, '')
      .replace(/^(?:action\s*item:?|task:?|todo:?|deliverable:?|next\s*step:?|\d+[\.\)]|\-)\s*/i, '')
      .replace(/^(?:will|to)\s+(?=(?:complete|take|submit|draft|prepare|review|research|send|schedule))\s*/i, '')
      .replace(/\s+(?:before|by)\s+(?:the\s+)?next\s+(?:meeting|session)\s*$/i, '')
      .replace(/[.,;]+$/, '')
      .trim();

    // Capitalize first letter
    if (cleanTitle.length > 0) {
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }

    const titleKey = cleanTitle.toLowerCase();
    if (cleanTitle.length >= 5 && !seenTaskTitles.has(titleKey)) {
      seenTaskTitles.add(titleKey);
      const sentence = getSentence(combinedText, itemText);
      const tentative = isHedging(sentence);

      candidates.push({
        id: `cand-${Date.now()}-task-${idx}`,
        meetingId,
        meetingDate,
        meetingType,
        category: 'task',
        fieldKey: 'tasks.newTask',
        destinationSection: 'Overview > Next Actions (Tasks)',
        displayField: 'Overview > Next Actions > Create Actionable Task',
        originalNoteQuote: sentence,
        proposedValue: cleanTitle,
        formattedProposedValue: `[${owner}] ${cleanTitle} (Due: ${dueDate})`,
        currentValue: 'New Task',
        formattedCurrentValue: 'Not in task list yet',
        hasConflict: false,
        isTentative: tentative,
        clarificationReason: tentative
          ? `Action item mentioned tentatively; confirm if this should be an official tracked task.`
          : undefined,
        taskDetails: {
          title: cleanTitle.length > 75 ? cleanTitle.substring(0, 75) : cleanTitle,
          description: `Generated from meeting on ${meetingDate}: ${sentence}`,
          owner,
          dueDate,
        },
        status: 'Pending',
      });
    }
  });

  return candidates;
}

function cleanMajorString(str: string): string {
  return str
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/\s+(as|in|for|and|with|or|that|confirmed|family)\s*$/i, '')
    .replace(/[,\.;]+$/, '')
    .trim();
}

function getNextDayOfWeek(dayOfWeek: number): Date {
  const d = new Date();
  const resultDate = new Date(d.getTime());
  resultDate.setDate(d.getDate() + ((7 + dayOfWeek - d.getDay()) % 7 || 7));
  return resultDate;
}
