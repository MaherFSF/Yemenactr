
# Research Findings: Yemen Microfinance Network

## 1. Research Process

The initial research phase focused on identifying and retrieving relevant documents from the Yemen Microfinance Network (YMN). The official YMN website (yemennetwork.org) was located, and an "Annual Reports" section was discovered. The following reports were downloaded:

*   Yemen Microfinance Network Annual Report- 2016-2017
*   Yemen Microfinance Network Annual Report- 2015-2016
*   Yemen Microfinance Network Annual Report- 2013

## 2. Data Extraction Challenges

Two primary methods were employed to extract data from the downloaded PDF reports:

1.  **Text Extraction:** A Python script using the `pypdf` library was created to extract text directly from the PDFs. This method failed to extract any meaningful text, suggesting the PDFs are likely image-based scans rather than text-based documents.

2.  **Optical Character Recognition (OCR):** To address the possibility of image-based PDFs, a second Python script was developed using `pytesseract` and `pdf2image`. This script was designed to convert the PDF pages to images and then use OCR to extract the text. However, this method also failed to produce any usable text output.

## 3. Data Quality and Gaps

Due to the insurmountable technical challenges in extracting data from the provided annual reports, no specific data points for the requested indicators (GDP, trade, humanitarian, financial, social) could be collected from this source. The available reports are not in a machine-readable format, and the quality of the scanned images prevents effective OCR.

**Key issues:**

*   **No machine-readable data:** The reports are image-based, not text-based.
*   **OCR failure:** The quality of the scanned documents is insufficient for accurate OCR.
*   **Limited recent data:** The most recent available report is for 2016-2017, with no data available for the 2018-2026 period.

As a result, there are significant data gaps for the entire 2010-2026 period from this specific source category.
