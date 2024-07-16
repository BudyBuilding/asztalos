package asztalos.controller;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import asztalos.model.Images;
import asztalos.service.ImagesService;
@CrossOrigin
@RestController
@RequestMapping("/images")
public class ImagesController {

    @Autowired
    private ImagesService imagesService;

@PostMapping("/upload")
public ResponseEntity<?> storeImages(@RequestParam("image") MultipartFile image) {
    try {
        Images savedImage = imagesService.storeImage(image);
        return ResponseEntity.status(HttpStatus.OK).body(savedImage);
    } catch (IOException e) {
        System.err.println("IOException while storing image: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error while storing image. Please try again.");
    } catch (IllegalArgumentException e) {
        System.err.println("Invalid argument: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid image file. Please upload a valid image.");
    } catch (Exception e) {
        System.err.println("Unexpected error: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Unexpected error occurred. Please try again.");
    }
}


    @GetMapping("/getImageByName/{imageName}")
    public ResponseEntity<byte[]> getImageByName(@PathVariable String imageName) {
        try {
            byte[] imageData = imagesService.downloadImagesFromFileSystem(imageName);

            // Determine content type dynamically based on image extension
            MediaType mediaType = getMediaTypeForImageName(imageName);
            if (mediaType == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok().contentType(mediaType).body(imageData);
        } catch (IOException e) {
            // Handle image read exception
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping()
    public ResponseEntity<List<Map<String, Object>>> getAllImages() {
        try {
            List<Map<String, Object>> imagesList = new ArrayList<>();
            Map<Images, byte[]> imagesMap = imagesService.getAllImages();

        for (Map.Entry<Images, byte[]> entry : imagesMap.entrySet()) {
            Images image = entry.getKey();
            byte[] imageData = entry.getValue();


            // Create JSON-compatible map
            Map<String, Object> imageInfo = new HashMap<>();
            imageInfo.put("image", image); // Assuming there's a getId method in Images class
            imageInfo.put("data", imageData); // Assuming there's a getData method in Images class
            imagesList.add(imageInfo);
        }

        return ResponseEntity.ok(imagesList);
    } catch (IOException e) {
        // Return a 500 Internal Server Error status with a meaningful message
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(List.of(
                                 Map.of("error", "Failed to fetch images. Please try again later.")
                             ));
    }
}


    // Helper method to determine MediaType based on image extension
    private MediaType getMediaTypeForImageName(String imageName) {
        String mimeType = null;
        try {
            Path path = Paths.get(imageName);
            mimeType = Files.probeContentType(path);
        } catch (IOException e) {
        }

        if (mimeType != null && !mimeType.isEmpty()) {
            return MediaType.parseMediaType(mimeType);
        }
        return null;
    }
}
