package asztalos.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import asztalos.model.Images;
import asztalos.repository.ImagesRepository;

@Service
public class ImagesService {

    private static final Log logger = LogFactory.getLog(ImagesService.class);

    @Autowired
    private ImagesRepository imageRepository;

    private final String IMAGE_PATH = "E:\\images\\";

    public Images storeImage(MultipartFile image) throws IOException {
        String imagePath = IMAGE_PATH + image.getOriginalFilename();
        String imageName = StringUtils.cleanPath(image.getOriginalFilename());
        Images images = Images.builder()
                .name(imageName.substring(0, imageName.indexOf('.')))
                .path(imagePath) // Csak az elérési út mentése
                .type(image.getContentType())
                .build();

        // Adatbázisba mentés (csak az elérési úttal)
        images = imageRepository.save(images);

        // Fájl mentése a fájlrendszerbe
        image.transferTo(new File(imagePath));
         
        if (images.getImageId() != null) {
            return images;
        }

        return null;
    }
    


    public byte[] downloadImagesFromFileSystem(String imageName) throws IOException {
        logger.info("Searching for image: " + imageName);
        Images images = imageRepository.findByName(imageName);
        if (images == null) {
            logger.error("File not found in database: " + imageName);
            throw new FileNotFoundException("File not found in database: " + imageName);
        }

        String path = images.getPath();
        return java.nio.file.Files.readAllBytes(new File(path).toPath());
    }

    
    public Map<Images, byte[]> getAllImages() throws IOException {
    List<Images> allImages = imageRepository.findAll();
    Map<Images, byte[]> result = new HashMap<>();

    for (Images image : allImages) {
        String path = image.getPath();
        byte[] imageBytes = java.nio.file.Files.readAllBytes(new File(path).toPath());
        result.put(image, imageBytes);
    }

    return result;
}


}
