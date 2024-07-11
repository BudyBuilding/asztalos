
package  asztalos.service;
import java.io.File;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import asztalos.model.Files;
import asztalos.repository.FilesRepository;


	
@Service
public class FilesService {

    @Autowired
    private FilesRepository fileRepository;

    private final String FILE_PATH = "E:\\images\\";

    public String storeFile(MultipartFile file) throws IOException {
        String filePath = FILE_PATH + file.getOriginalFilename();

        Files files = Files.builder()
                .name(file.getOriginalFilename())
                .path(filePath)  // Csak az elérési út mentése
                .type(file.getContentType())
                .build();

        // Adatbázisba mentés (csak az elérési úttal)
        files = fileRepository.save(files);

        // Fájl mentése a fájlrendszerbe
        file.transferTo(new File(filePath));

        if (files.getId() != null) {
            return "File uploaded successfully into database";
        }

        return null;
    }

    public byte[] getFiles(String fileName) {
        return fileRepository.findByName(fileName).getImageData();
    }

    public byte[] downloadFilesFromFileSystem(String fileName) throws IOException {
        String path = fileRepository.findByName(fileName).getPath();

        return java.nio.file.Files.readAllBytes(new File(path).toPath());
    }
}
