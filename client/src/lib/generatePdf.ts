import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { QuizResult, LANGUAGE_INFO, LoveLanguage } from './quizData';

/**
 * Detect mobile device
 */
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Cross-browser/mobile PDF download
 * On mobile: opens PDF in new tab for user to save manually
 * On desktop: triggers direct download
 */
function downloadPdf(doc: jsPDF, filename: string): void {
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  if (isMobileDevice()) {
    // Mobile: open in new tab so user can view and save
    // This works reliably on Samsung Internet, Chrome for Android, Safari iOS
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow) {
      // Fallback: use a link with download attribute
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } else {
      // Revoke after a delay to let the new tab load
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
  } else {
    // Desktop: direct download via link click
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 500);
  }
}

/**
 * Generate a PDF report from quiz results
 * Uses html2canvas to render a hidden DOM element, then captures it as image for PDF
 * This approach ensures Korean text renders correctly
 * 
 * Returns: { isMobile: boolean } to help caller show appropriate toast
 */
export async function generateResultPdf(result: QuizResult): Promise<{ isMobile: boolean }> {
  const primaryLang = LANGUAGE_INFO[result.primary];
  const secondaryLang = LANGUAGE_INFO[result.secondary];
  const sortedScores = (Object.entries(result.scores) as [LoveLanguage, number][])
    .sort((a, b) => b[1] - a[1]);

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const fileDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const filename = `예봄-사랑의언어_진단결과_${fileDate}.pdf`;

  // Create hidden container for rendering
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    background: #FDF8F4;
    font-family: 'Noto Sans KR', sans-serif;
    padding: 0;
    z-index: -1;
  `;

  container.innerHTML = `
    <div style="padding: 50px; min-height: 1123px; box-sizing: border-box;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 10px;">
        <p style="font-size: 13px; color: #3D3535; opacity: 0.5; margin: 0; letter-spacing: 2px;">예봄 부부의 삶</p>
      </div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 100px; height: 1px; background: #E8736F; margin: 12px auto;"></div>
      </div>
      
      <!-- Title -->
      <div style="text-align: center; margin-bottom: 8px;">
        <h1 style="font-family: 'Noto Serif KR', serif; font-size: 28px; color: #3D3535; margin: 0;">5가지 사랑의 언어</h1>
      </div>
      <div style="text-align: center; margin-bottom: 8px;">
        <p style="font-family: 'Noto Serif KR', serif; font-size: 18px; color: #3D3535; margin: 0;">진단 결과서</p>
      </div>
      <div style="text-align: center; margin-bottom: 40px;">
        <p style="font-size: 12px; color: #888; margin: 0;">${dateStr}</p>
      </div>

      <!-- Main Result Box -->
      <div style="background: white; border: 1.5px solid #E8736F; border-radius: 16px; padding: 30px; margin-bottom: 35px; text-align: center;">
        <p style="font-size: 13px; color: #E8736F; margin: 0 0 12px 0; font-weight: 500;">나의 주된 사랑의 언어</p>
        <p style="font-size: 36px; margin: 0 0 6px 0;">${primaryLang.icon}</p>
        <h2 style="font-family: 'Noto Serif KR', serif; font-size: 26px; color: #3D3535; margin: 0 0 6px 0;">${primaryLang.name}</h2>
        <p style="font-size: 12px; color: #888; margin: 0 0 14px 0;">${primaryLang.nameEn}</p>
        <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0; max-width: 500px; margin-left: auto; margin-right: auto;">${primaryLang.description}</p>
      </div>

      <!-- Score Breakdown -->
      <div style="margin-bottom: 35px;">
        <h3 style="font-family: 'Noto Serif KR', serif; font-size: 16px; color: #3D3535; text-align: center; margin: 0 0 20px 0;">점수 분포</h3>
        ${sortedScores.map(([key, score], index) => {
          const lang = LANGUAGE_INFO[key];
          const percentage = (score / 30) * 100;
          const badge = index === 0 ? '<span style="font-size: 10px; background: ' + lang.colorLight + '; color: ' + lang.color + '; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">주 언어</span>' : index === 1 ? '<span style="font-size: 10px; background: #f0f0f0; color: #888; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">보조 언어</span>' : '';
          return `
            <div style="margin-bottom: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 18px; margin-right: 8px;">${lang.icon}</span>
                  <span style="font-size: 13px; font-weight: 500; color: #3D3535;">${lang.name}</span>
                  ${badge}
                </div>
                <span style="font-size: 13px; font-weight: 700; color: ${lang.color};">${score}점</span>
              </div>
              <div style="height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden;">
                <div style="height: 100%; width: ${percentage}%; background: ${lang.color}; border-radius: 5px;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Secondary Language -->
      <div style="background: ${secondaryLang.colorLight}60; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <span style="font-size: 22px;">${secondaryLang.icon}</span>
          <div>
            <p style="font-family: 'Noto Serif KR', serif; font-size: 14px; font-weight: 600; color: #3D3535; margin: 0;">보조 사랑의 언어: ${secondaryLang.name}</p>
            <p style="font-size: 11px; color: #888; margin: 2px 0 0 0;">${secondaryLang.nameEn} — ${result.scores[result.secondary]}점</p>
          </div>
        </div>
        <p style="font-size: 12px; color: #555; line-height: 1.7; margin: 0;">${secondaryLang.description}</p>
      </div>
    </div>

    <!-- Page 2 -->
    <div style="padding: 50px; min-height: 1123px; box-sizing: border-box; border-top: 1px solid #eee;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 11px; color: #aaa; margin: 0;">예봄 부부의 삶 | 5가지 사랑의 언어 진단</p>
      </div>

      <!-- Primary Language Details -->
      <div style="margin-bottom: 35px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 24px;">${primaryLang.icon}</span>
          <div>
            <h3 style="font-family: 'Noto Serif KR', serif; font-size: 17px; color: #3D3535; margin: 0;">${primaryLang.name} 유형의 특징</h3>
            <p style="font-size: 11px; color: #888; margin: 2px 0 0 0;">${primaryLang.nameEn}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <h4 style="font-size: 13px; font-weight: 600; color: #3D3535; margin: 0 0 10px 0;">주요 특성</h4>
            ${primaryLang.characteristics.map(char => `
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span style="width: 5px; height: 5px; border-radius: 50%; background: ${primaryLang.color}; margin-top: 7px; flex-shrink: 0;"></span>
                <span style="font-size: 12px; color: #555; line-height: 1.6;">${char}</span>
              </div>
            `).join('')}
          </div>
          <div>
            <h4 style="font-size: 13px; font-weight: 600; color: #3D3535; margin: 0 0 10px 0;">실천 방법</h4>
            ${primaryLang.tips.map(tip => `
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span style="width: 5px; height: 5px; border-radius: 50%; background: #F5A623; margin-top: 7px; flex-shrink: 0;"></span>
                <span style="font-size: 12px; color: #555; line-height: 1.6;">${tip}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Secondary Language Details -->
      <div style="margin-bottom: 35px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 24px;">${secondaryLang.icon}</span>
          <div>
            <h3 style="font-family: 'Noto Serif KR', serif; font-size: 17px; color: #3D3535; margin: 0;">${secondaryLang.name} (보조 언어)</h3>
            <p style="font-size: 11px; color: #888; margin: 2px 0 0 0;">${secondaryLang.nameEn}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <h4 style="font-size: 13px; font-weight: 600; color: #3D3535; margin: 0 0 10px 0;">주요 특성</h4>
            ${secondaryLang.characteristics.map(char => `
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span style="width: 5px; height: 5px; border-radius: 50%; background: ${secondaryLang.color}; margin-top: 7px; flex-shrink: 0;"></span>
                <span style="font-size: 12px; color: #555; line-height: 1.6;">${char}</span>
              </div>
            `).join('')}
          </div>
          <div>
            <h4 style="font-size: 13px; font-weight: 600; color: #3D3535; margin: 0 0 10px 0;">실천 방법</h4>
            ${secondaryLang.tips.map(tip => `
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span style="width: 5px; height: 5px; border-radius: 50%; background: #F5A623; margin-top: 7px; flex-shrink: 0;"></span>
                <span style="font-size: 12px; color: #555; line-height: 1.6;">${tip}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Interpretation Guide -->
      <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
        <h3 style="font-family: 'Noto Serif KR', serif; font-size: 14px; color: #3D3535; margin: 0 0 12px 0;">결과 해석 가이드</h3>
        <div style="font-size: 11px; color: #666; line-height: 1.8;">
          <p style="margin: 0 0 6px 0;">• 주된 사랑의 언어는 당신이 가장 자연스럽게 사랑을 느끼는 방식입니다.</p>
          <p style="margin: 0 0 6px 0;">• 보조 사랑의 언어는 두 번째로 중요한 방식으로, 주 언어와 함께 충족될 때 만족도가 높아집니다.</p>
          <p style="margin: 0 0 6px 0;">• 이 결과를 파트너나 가족과 공유하면 서로의 사랑 표현 방식을 더 잘 이해할 수 있습니다.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #aaa; margin: 0 0 4px 0;">Based on "The Five Love Languages" by Dr. Gary Chapman</p>
        <p style="font-size: 11px; color: #aaa; margin: 0 0 4px 0;">본 진단은 교육 및 자기이해 목적으로 제공됩니다.</p>
        <p style="font-size: 12px; color: #888; margin: 8px 0 0 0; font-weight: 500;">예봄 부부의 삶 | 사랑의 언어 진단</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;
  // Small delay to ensure rendering
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FDF8F4',
      width: 794,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // If content is taller than one page, split into pages
    const pageHeight = 297;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = -pageHeight + (imgHeight - heightLeft - pageHeight);
      doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, -(imgHeight - heightLeft), imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Use cross-browser/mobile compatible download
    downloadPdf(doc, filename);

    return { isMobile: isMobileDevice() };
  } finally {
    document.body.removeChild(container);
  }
}
