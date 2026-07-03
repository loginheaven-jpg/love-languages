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
 * Mobile strategy:
 *  1. Convert PDF to base64 data URI
 *  2. Open in new tab using data URI (more reliable than blob URL on mobile)
 *  3. Fallback: create temporary download link
 * Desktop: direct download via link click
 */
function downloadPdf(doc: jsPDF, filename: string): void {
  if (isMobileDevice()) {
    // Mobile: Use data URI approach which is more reliable across mobile browsers
    try {
      const pdfDataUri = doc.output('datauristring', { filename });
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${filename}</title>
            <style>
              body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; background: #f5f5f5; font-family: -apple-system, sans-serif; }
              .header { padding: 16px; text-align: center; background: white; width: 100%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
              .header h3 { margin: 0 0 8px 0; font-size: 14px; color: #333; }
              .header p { margin: 0 0 12px 0; font-size: 12px; color: #666; }
              .download-btn { display: inline-block; padding: 10px 24px; background: #E8736F; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
              .download-btn:active { transform: scale(0.97); }
              iframe { width: 100%; height: calc(100vh - 120px); border: none; margin-top: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>📄 ${filename}</h3>
              <p>아래 버튼을 눌러 PDF를 저장하세요</p>
              <a class="download-btn" id="downloadBtn" download="${filename}">📥 PDF 저장하기</a>
            </div>
            <iframe id="pdfFrame"></iframe>
            <script>
              var pdfData = "${doc.output('dataurlstring')}";
              document.getElementById('pdfFrame').src = pdfData;
              // Create blob for download button
              var byteString = atob(pdfData.split(',')[1]);
              var ab = new ArrayBuffer(byteString.length);
              var ia = new Uint8Array(ab);
              for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
              var blob = new Blob([ab], { type: 'application/pdf' });
              var url = URL.createObjectURL(blob);
              document.getElementById('downloadBtn').href = url;
            </script>
          </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Popup blocked fallback: direct blob download
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }
    } catch {
      // Ultimate fallback
      doc.save(filename);
    }
  } else {
    // Desktop: direct download via link click
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
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
 * Render HTML container to PDF pages
 */
async function renderToPdf(container: HTMLElement, filename: string): Promise<{ isMobile: boolean }> {
  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 300));

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

    const pageHeight = 297;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, -(imgHeight - heightLeft), imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    downloadPdf(doc, filename);
    return { isMobile: isMobileDevice() };
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generate a PDF report from individual quiz results
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
      <div style="text-align: center; margin-bottom: 10px;">
        <p style="font-size: 13px; color: #3D3535; opacity: 0.5; margin: 0; letter-spacing: 2px;">예봄 부부의 삶</p>
      </div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 100px; height: 1px; background: #E8736F; margin: 12px auto;"></div>
      </div>
      <div style="text-align: center; margin-bottom: 8px;">
        <h1 style="font-family: 'Noto Serif KR', serif; font-size: 28px; color: #3D3535; margin: 0;">5가지 사랑의 언어</h1>
      </div>
      <div style="text-align: center; margin-bottom: 8px;">
        <p style="font-family: 'Noto Serif KR', serif; font-size: 18px; color: #3D3535; margin: 0;">진단 결과서</p>
      </div>
      <div style="text-align: center; margin-bottom: 40px;">
        <p style="font-size: 12px; color: #888; margin: 0;">${dateStr}</p>
      </div>
      <div style="background: white; border: 1.5px solid #E8736F; border-radius: 16px; padding: 30px; margin-bottom: 35px; text-align: center;">
        <p style="font-size: 13px; color: #E8736F; margin: 0 0 12px 0; font-weight: 500;">나의 주된 사랑의 언어</p>
        <p style="font-size: 36px; margin: 0 0 6px 0;">${primaryLang.icon}</p>
        <h2 style="font-family: 'Noto Serif KR', serif; font-size: 26px; color: #3D3535; margin: 0 0 6px 0;">${primaryLang.name}</h2>
        <p style="font-size: 12px; color: #888; margin: 0 0 14px 0;">${primaryLang.nameEn}</p>
        <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0; max-width: 500px; margin-left: auto; margin-right: auto;">${primaryLang.description}</p>
      </div>
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
    <div style="padding: 50px; min-height: 1123px; box-sizing: border-box; border-top: 1px solid #eee;">
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 11px; color: #aaa; margin: 0;">예봄 부부의 삶 | 5가지 사랑의 언어 진단</p>
      </div>
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
      <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
        <h3 style="font-family: 'Noto Serif KR', serif; font-size: 14px; color: #3D3535; margin: 0 0 12px 0;">결과 해석 가이드</h3>
        <div style="font-size: 11px; color: #666; line-height: 1.8;">
          <p style="margin: 0 0 6px 0;">• 주된 사랑의 언어는 당신이 가장 자연스럽게 사랑을 느끼는 방식입니다.</p>
          <p style="margin: 0 0 6px 0;">• 보조 사랑의 언어는 두 번째로 중요한 방식으로, 주 언어와 함께 충족될 때 만족도가 높아집니다.</p>
          <p style="margin: 0 0 6px 0;">• 이 결과를 파트너나 가족과 공유하면 서로의 사랑 표현 방식을 더 잘 이해할 수 있습니다.</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #aaa; margin: 0 0 4px 0;">Based on "The Five Love Languages" by Dr. Gary Chapman</p>
        <p style="font-size: 11px; color: #aaa; margin: 0 0 4px 0;">본 진단은 교육 및 자기이해 목적으로 제공됩니다.</p>
        <p style="font-size: 12px; color: #888; margin: 8px 0 0 0; font-weight: 500;">예봄 부부의 삶 | 사랑의 언어 진단</p>
      </div>
    </div>
  `;

  return renderToPdf(container, filename);
}

/**
 * Generate a comparison PDF report for two people
 */
export interface CompareScores {
  scores: Record<LoveLanguage, number>;
  primary: LoveLanguage;
  secondary: LoveLanguage;
}

export async function generateComparePdf(
  myResult: CompareScores,
  spouseResult: CompareScores
): Promise<{ isMobile: boolean }> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const fileDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const filename = `예봄-사랑의언어_커플비교_${fileDate}.pdf`;

  const myPrimary = LANGUAGE_INFO[myResult.primary];
  const spousePrimary = LANGUAGE_INFO[spouseResult.primary];
  const languages: LoveLanguage[] = ['A', 'B', 'C', 'D', 'E'];

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
        <div style="width: 100px; height: 1px; background: #7B68EE; margin: 12px auto;"></div>
      </div>
      <div style="text-align: center; margin-bottom: 8px;">
        <h1 style="font-family: 'Noto Serif KR', serif; font-size: 28px; color: #3D3535; margin: 0;">사랑의 언어 비교 리포트</h1>
      </div>
      <div style="text-align: center; margin-bottom: 40px;">
        <p style="font-size: 12px; color: #888; margin: 0;">${dateStr}</p>
      </div>

      <!-- Two Primary Languages -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
        <div style="background: white; border: 1.5px solid #E8736F; border-radius: 16px; padding: 24px; text-align: center;">
          <p style="font-size: 11px; color: #E8736F; font-weight: 600; margin: 0 0 10px 0;">나</p>
          <p style="font-size: 32px; margin: 0 0 6px 0;">${myPrimary.icon}</p>
          <h3 style="font-family: 'Noto Serif KR', serif; font-size: 20px; color: #3D3535; margin: 0 0 4px 0;">${myPrimary.name}</h3>
          <p style="font-size: 11px; color: #888; margin: 0;">${myPrimary.nameEn}</p>
        </div>
        <div style="background: white; border: 1.5px solid #7B68EE; border-radius: 16px; padding: 24px; text-align: center;">
          <p style="font-size: 11px; color: #7B68EE; font-weight: 600; margin: 0 0 10px 0;">배우자</p>
          <p style="font-size: 32px; margin: 0 0 6px 0;">${spousePrimary.icon}</p>
          <h3 style="font-family: 'Noto Serif KR', serif; font-size: 20px; color: #3D3535; margin: 0 0 4px 0;">${spousePrimary.name}</h3>
          <p style="font-size: 11px; color: #888; margin: 0;">${spousePrimary.nameEn}</p>
        </div>
      </div>

      <!-- Score Comparison -->
      <div style="background: white; border-radius: 16px; padding: 30px; margin-bottom: 30px; border: 1px solid #eee;">
        <h3 style="font-family: 'Noto Serif KR', serif; font-size: 16px; color: #3D3535; text-align: center; margin: 0 0 24px 0;">점수 비교</h3>
        ${languages.map(key => {
          const lang = LANGUAGE_INFO[key];
          const myScore = myResult.scores[key];
          const spouseScore = spouseResult.scores[key];
          return `
            <div style="margin-bottom: 18px;">
              <div style="text-align: center; margin-bottom: 8px;">
                <span style="font-size: 16px;">${lang.icon}</span>
                <span style="font-size: 13px; font-weight: 500; color: #3D3535; margin-left: 6px;">${lang.name}</span>
              </div>
              <div style="display: grid; grid-template-columns: 60px 1fr 20px 1fr 60px; align-items: center; gap: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #E8736F; text-align: right;">${myScore}점</span>
                <div style="height: 12px; background: #f0f0f0; border-radius: 6px; overflow: hidden; direction: rtl;">
                  <div style="height: 100%; width: ${(myScore / 12) * 100}%; background: #E8736F; border-radius: 6px;"></div>
                </div>
                <div style="width: 1px; height: 12px; background: #ddd; margin: 0 auto;"></div>
                <div style="height: 12px; background: #f0f0f0; border-radius: 6px; overflow: hidden;">
                  <div style="height: 100%; width: ${(spouseScore / 12) * 100}%; background: #7B68EE; border-radius: 6px;"></div>
                </div>
                <span style="font-size: 12px; font-weight: 700; color: #7B68EE;">${spouseScore}점</span>
              </div>
            </div>
          `;
        }).join('')}
        <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #E8736F;"></div>
            <span style="font-size: 11px; color: #666;">나</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #7B68EE;"></div>
            <span style="font-size: 11px; color: #666;">배우자</span>
          </div>
        </div>
      </div>

      <!-- Relationship Insight -->
      <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid #eee;">
        <h3 style="font-family: 'Noto Serif KR', serif; font-size: 15px; color: #3D3535; margin: 0 0 12px 0;">관계 인사이트</h3>
        ${myResult.primary === spouseResult.primary ? `
          <p style="font-size: 12px; color: #555; line-height: 1.8; margin: 0;">
            두 분 모두 <strong style="color: ${myPrimary.color};">${myPrimary.name}</strong>을(를) 주된 사랑의 언어로 가지고 있습니다.
            서로의 사랑 표현을 자연스럽게 이해하고 받아들일 수 있는 좋은 조합입니다.
          </p>
        ` : `
          <p style="font-size: 12px; color: #555; line-height: 1.8; margin: 0 0 8px 0;">
            <strong>나</strong>는 <strong style="color: #E8736F;">${myPrimary.name}</strong>으로 사랑을 느끼고,
            <strong>배우자</strong>는 <strong style="color: #7B68EE;">${spousePrimary.name}</strong>으로 사랑을 느낍니다.
          </p>
          <p style="font-size: 12px; color: #555; line-height: 1.8; margin: 0;">
            서로의 사랑의 언어가 다르다는 것을 인식하고, 상대방이 원하는 방식으로 사랑을 표현해보세요.
            나는 배우자에게 ${spousePrimary.name}을(를) 더 표현하고, 배우자는 나에게 ${myPrimary.name}을(를) 더 표현하면 관계가 더 깊어질 수 있습니다.
          </p>
        `}
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #aaa; margin: 0 0 4px 0;">Based on "The Five Love Languages" by Dr. Gary Chapman</p>
        <p style="font-size: 11px; color: #aaa; margin: 0 0 4px 0;">본 진단은 교육 및 자기이해 목적으로 제공됩니다.</p>
        <p style="font-size: 12px; color: #888; margin: 8px 0 0 0; font-weight: 500;">예봄 부부의 삶 | 사랑의 언어 진단</p>
      </div>
    </div>
  `;

  return renderToPdf(container, filename);
}
