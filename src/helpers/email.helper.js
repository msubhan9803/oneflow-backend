/**
 * Styles
 *
 * color: #fff;
 * color: #000;
 * color: #4f504f;
 *
 * font-weight: 400; // regular
 * font-weight: 500; // medium
 *
 * font-size: 12px;
 * font-size: 14px;
 * font-size: 16px;
 * font-size: 18px;
 * font-size: 25px;
 */

const getSubject1 = (subjectText) => {
  return `
        <tr>
          <td style="font-size: 25px; color: #000000; font-weight: 500; line-height: 24px; padding-top: 10px;">
            ${subjectText}
          </td>
        </tr>
      `;
};

const getSubject2 = (subjectText) => {
  return `
        <tr>
          <td style="font-size: 22px; color: #000000; font-weight: 500; line-height: 24px; padding-top: 10px;">
            ${subjectText}
          </td>
        </tr>
      `;
};

const getMessageDark = (message) => {
  return `
        <tr>
          <td style="font-size: 18px; color: #000000; font-weight: 500; padding-top: 7px; line-height: 24px;">
            ${message}
          </td>
        </tr>
      `;
};

const getMessageGray = (message) => {
  return `
        <tr>
          <td style="font-size: 18px; color: #4F504F; font-weight: 500; padding-top: 12px; line-height: 20px;">
            ${message}
          </td>
        </tr>
      `;
};

// if no subject
const getTitleBlack = (title) => {
  return `
        <tr>
          <td style="font-size: 18px; color: #000000; font-weight: 500; padding-top: 10px;">
            ${title}
          </td>
        </tr>
      `;
};

const getSubtitle1 = (title) => {
  return `
        <tr>
          <td style="font-size: 12px; color: #4F504F; font-weight: 500; padding-top: 18px;">
            ${title}
          </td>
        </tr>
      `;
};

const getHr = () => {
  return `
        <tr>
            <td style="padding-top: 18px;">
                <hr style="width: 100%; border: none; border-top: 1px solid #eaeaea;" />
            </td>
        </tr>
      `;
};

const getBr = () => {
  return '<br />';
};

const getButton = (btntext, btnLink) => {
  return `
        <tr>
            <td style="padding-top: 34px;" align="left">
                <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td bgcolor="#2bae2b" style="border-radius: 25px; padding: 12px 28px 12px 28px">
                            <a href="${btnLink}" target="_blank" style="color: #fff; font-weight: 500; text-decoration: none; font-size: 16px; min-width: 220px;">
                                ${btntext}
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
      `;
};

const getTableRow1 = (title, text) => {
  return `
    <tr>
      <td align="left" width="50%" style="color: #4F504F; font-size: 18px; font-family: Inter; font-weight: 500; padding-top: 12px;">${title}</td>
      <td align="right" width="50%" style="color: #4F504F; font-size: 18px; font-family: Inter; font-weight: 500; padding-top: 12px;">${text}</td>
    </tr>
  `;
};

const getTableRow2 = (title, text) => {
  return `
    <tr>
        <td align="left" style="color: #000; font-size: 18px; font-family: Inter; font-weight: 600; padding-top: 24px;"><b>${title}</b></td>
        <td align="right" style="color: #000; font-size: 18px; font-family: Inter; font-weight: 500; padding-top: 24px;"><b>${text}</b></td>
    </tr>
  `;
};

const getTable = (childrens) => {
  const start = `
          <tr>
              <td>
      `;

  const tableWrapperStart = '<table cellspacing="0" cellpadding="0" border="0" width="100%">';

  const tableChildrens = childrens.join('');

  const tableWrapperEnd = '</table>';

  const end = `
              </td>
          </tr>
      `;

  const table = start + tableWrapperStart + tableChildrens + tableWrapperEnd + end;
  return table;
};

module.exports = {
  getSubject1,
  getSubject2,
  getMessageDark,
  getMessageGray,
  getTitleBlack,
  getSubtitle1,
  getHr,
  getBr,
  getButton,
  getTable,
  getTableRow1,
  getTableRow2,
};
