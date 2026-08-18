package com.prepwise.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Slf4j
@Service
public class TextExtractionService {

    public String extractText(byte[] fileBytes, String fileType, String originalFilename) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalArgumentException("File content is empty");
        }

        String lowerFilename = originalFilename != null ? originalFilename.toLowerCase() : "";
        String lowerFileType = fileType != null ? fileType.toLowerCase() : "";

        boolean isPdf = lowerFilename.endsWith(".pdf") || lowerFileType.contains("pdf");
        boolean isDocx = lowerFilename.endsWith(".docx") || lowerFileType.contains("wordprocessingml") || lowerFileType.contains("docx");

        if (!isPdf && !isDocx) {
            throw new IllegalArgumentException("Invalid file format. Only PDF and DOCX files are supported.");
        }

        try {
            if (isPdf) {
                return extractTextFromPdf(fileBytes);
            } else {
                return extractTextFromDocx(fileBytes);
            }
        } catch (Exception e) {
            log.error("Failed to extract text from file: {}", originalFilename, e);
            throw new RuntimeException("Failed to extract text from document: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(byte[] fileBytes) throws Exception {
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text == null || text.isBlank()) {
                throw new IllegalArgumentException("Extracted PDF text is empty. The file may be scanned or image-only.");
            }
            return text.trim();
        }
    }

    private String extractTextFromDocx(byte[] fileBytes) throws Exception {
        try (InputStream is = new ByteArrayInputStream(fileBytes);
             XWPFDocument document = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            if (text == null || text.isBlank()) {
                throw new IllegalArgumentException("Extracted DOCX text is empty.");
            }
            return text.trim();
        }
    }
}
