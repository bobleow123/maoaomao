export function extractDouyinVideoId(input) {
  if (!input) return null;
  
  const trimmed = input.trim();
  
  const idPattern = /^[a-zA-Z0-9_-]{10,}$/;
  if (idPattern.test(trimmed)) {
    return trimmed;
  }
  
  const urlPatterns = [
    /video\/([a-zA-Z0-9_-]+)/,
    /\/v\/([a-zA-Z0-9_-]+)/,
    /share\/user\/[^/]+\/video\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export function parseSummary(summaryText) {
  const sections = {
    breed: '',
    action: '',
    mood: '',
    catKnowledge: '',
    videoKnowledge: '',
    guideSupplement: '',
    raw: summaryText,
    isNewFormat: false
  };
  
  const lines = summaryText.split('\n').filter(l => l.trim());
  
  let currentSection = '';
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.includes('猫的品种') || trimmed.includes('【猫的品种】')) {
      currentSection = 'breed';
      sections.isNewFormat = true;
    } else if (trimmed.includes('猫在做什么') || trimmed.includes('【猫在做什么】')) {
      currentSection = 'action';
    } else if (trimmed.includes('猫的情绪状态') || trimmed.includes('【猫的情绪状态】')) {
      currentSection = 'mood';
    } else if (trimmed.includes('养猫知识总结') || trimmed.includes('【养猫知识总结】')) {
      currentSection = 'catKnowledge';
    } else if (trimmed.includes('视频中与猫有关的知识') || trimmed.includes('【视频中与猫有关的知识】')) {
      currentSection = 'videoKnowledge';
    } else if (trimmed.includes('给图鉴的补充简介') || trimmed.includes('【给图鉴的补充简介】')) {
      currentSection = 'guideSupplement';
    } else if (currentSection === 'breed' && trimmed && !trimmed.includes('【') && !trimmed.includes('（')) {
      sections.breed += (sections.breed ? ' ' : '') + trimmed;
    } else if (currentSection === 'action' && trimmed && !trimmed.includes('【') && !trimmed.includes('（')) {
      sections.action += (sections.action ? ' ' : '') + trimmed;
    } else if (currentSection === 'mood' && trimmed && !trimmed.includes('【') && !trimmed.includes('（')) {
      sections.mood += (sections.mood ? ' ' : '') + trimmed;
    } else if (currentSection === 'catKnowledge' && trimmed && !trimmed.includes('【') && !trimmed.includes('（')) {
      sections.catKnowledge += (sections.catKnowledge ? '\n' : '') + trimmed;
    } else if (currentSection === 'videoKnowledge' && trimmed && !trimmed.includes('【') && !trimmed.includes('（')) {
      sections.videoKnowledge += (sections.videoKnowledge ? '\n' : '') + trimmed;
    } else if (currentSection === 'guideSupplement' && trimmed && !trimmed.includes('【') && !trimmed.includes('（')) {
      sections.guideSupplement += (sections.guideSupplement ? ' ' : '') + trimmed;
    }
  });
  
  // 如果新格式解析失败，尝试解析旧格式
  if (!sections.isNewFormat) {
    const oldSections = {
      theme: '',
      keyPoints: [],
      essence: '',
      raw: summaryText
    };
    
    let currentOldSection = '';
    let inKeyPoints = false;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.includes('视频主题概括') || trimmed.includes('【视频主题概括】')) {
        currentOldSection = 'theme';
        inKeyPoints = false;
      } else if (trimmed.includes('核心情节要点') || trimmed.includes('【核心情节要点】')) {
        currentOldSection = 'keyPoints';
        inKeyPoints = true;
      } else if (trimmed.includes('内容主旨提炼') || trimmed.includes('【内容主旨提炼】')) {
        currentOldSection = 'essence';
        inKeyPoints = false;
      } else if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || 
                 trimmed.startsWith('4.') || trimmed.startsWith('5.') || trimmed.startsWith('6.')) {
        if (inKeyPoints || currentOldSection === 'keyPoints') {
          oldSections.keyPoints.push(trimmed.replace(/^\d+\.\s*/, ''));
        }
      } else if (currentOldSection === 'theme' && trimmed && !trimmed.includes('【')) {
        oldSections.theme += (oldSections.theme ? ' ' : '') + trimmed;
      } else if (currentOldSection === 'essence' && trimmed && !trimmed.includes('【')) {
        oldSections.essence += (oldSections.essence ? ' ' : '') + trimmed;
      }
    });
    
    // 如果旧格式也没有，回退到最初格式
    if (!oldSections.theme && !oldSections.keyPoints.length && !oldSections.essence) {
      const categories = {
        health: [],
        tools: [],
        behavior: []
      };
      
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('健康') || lowerLine.includes('health')) {
          categories.health.push(line.trim());
        } else if (lowerLine.includes('用具') || lowerLine.includes('工具') || lowerLine.includes('tool')) {
          categories.tools.push(line.trim());
        } else if (lowerLine.includes('行为') || lowerLine.includes('behavior')) {
          categories.behavior.push(line.trim());
        }
      });
      
      return {
        raw: summaryText,
        categories,
        allLines: lines,
        isLegacy: true
      };
    }
    
    return {
      ...oldSections,
      allLines: lines,
      isLegacy: false,
      isOldFormat: true
    };
  }
  
  return {
    ...sections,
    allLines: lines,
    isLegacy: false
  };
}
