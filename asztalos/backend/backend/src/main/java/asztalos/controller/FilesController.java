package asztalos.controller;
import java.io.IOException;

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
            byte[] fileData = filesService.getFiles(fileName);
            return ResponseEntity.ok().contentType(MediaType.valueOf("image/jpg")).body(fileData);
        } catch (Exception e) {
            // Kezeljük a hibát, ha a fájl nem található vagy más hiba történik
            return ResponseEntity.notFound().build();
        }
    }
}
