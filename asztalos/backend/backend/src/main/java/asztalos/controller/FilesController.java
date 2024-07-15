package asztalos.controller;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import asztalos.service.FilesService;
@RestController
@RequestMapping("/api")
public class FilesController {

    @Autowired
    private FilesService filesService;

    @PostMapping("/uploadFiles")
    public ResponseEntity<String> storeFiles(@RequestParam("file") MultipartFile file) throws IOException {
        String response = filesService.storeFile(file);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
    @GetMapping("/getFileByName/{fileName}")
    public ResponseEntity<byte[]> getFileByName(@PathVariable String fileName) {
        try {
            byte[] fileData = filesService.downloadFilesFromFileSystem(fileName);

            // Determine content type dynamically based on file extension
            MediaType mediaType = getMediaTypeForFileName(fileName);
            if (mediaType == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok().contentType(mediaType).body(fileData);
        } catch (IOException e) {
            // Handle file read exception
            return ResponseEntity.notFound().build();
        }
    }

    // Helper method to determine MediaType based on file extension
    private MediaType getMediaTypeForFileName(String fileName) {
        String mimeType = null;
        try {
            Path path = Paths.get(fileName);
            mimeType = Files.probeContentType(path);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (mimeType != null && !mimeType.isEmpty()) {
            return MediaType.parseMediaType(mimeType);
        }
        return null;
    }
}
