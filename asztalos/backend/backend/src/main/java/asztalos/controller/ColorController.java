package asztalos.controller;

import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.io.IOException;
import org.springframework.util.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import asztalos.model.Color;
import asztalos.model.User;
import asztalos.service.ColorService;
import asztalos.service.UserService;
@RestController
@RequestMapping("/colors")
public class ColorController {

    @Autowired
    private ColorService colorService;

    @Autowired
    private UserService userService; 
    @Value("${upload.path}")
    private String uploadPath;

    private boolean isAdminOrManager(User user) {
        return user.getRole().equals("admin") 
            || user.getRole().equals("manager")
            || user.getRole().equals("companyAdmin")
            || user.getRole().equals("companyUser");
    }

 /*   @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Color> createColor(@RequestBody Color color) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !isAdminOrManager(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        Color createdColor = colorService.saveColor(color);
        return ResponseEntity.ok(createdColor);
    }*/

       /**
        * Create color with JSON payload (base64-ben ágyazott kép).
        */
       @PostMapping
       public ResponseEntity<Color> createColorJson(@RequestBody Color colorDetails) {
           Authentication auth = SecurityContextHolder.getContext().getAuthentication();
           Optional<User> currentUser = userService.findByUsername(auth.getName());
           if (!currentUser.isPresent() || !isAdminOrManager(currentUser.get())) {
               return ResponseEntity.status(403).build();
           }
           Color saved = colorService.saveColor(colorDetails);
           return ResponseEntity.ok(saved);
       }
   




    // Képfájl letöltése a Color objektumból
    @GetMapping("/download/{colorId}")
    public ResponseEntity<Resource> downloadImage(@PathVariable Long colorId) {
        try {
            Color color = colorService.findById(colorId);
            if (color == null || color.getImageId() == null) {
                return ResponseEntity.notFound().build();
            }

            Path imagePath = Paths.get(uploadPath + color.getImageId());
            Resource resource = new UrlResource(imagePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok().body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            return ResponseEntity.status(500).build(); // Hiba esetén belső szerver hiba
        }
    }



@PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Color> updateColorWithImage(
        @PathVariable Long id,
        @RequestPart("metadata") Color colorDetails,
        @RequestPart(value = "image", required = false) MultipartFile image
) throws IOException {
    // … jogosultság- és létezés-ellenőrzés …

    Color existingColor = colorService.findById(id);
    if (existingColor == null) {
        return ResponseEntity.notFound().build();
    }

    try {
        for (Field f : Color.class.getDeclaredFields()) {
            f.setAccessible(true);
            if ("imageData".equals(f.getName()) || "imageContentType".equals(f.getName())) continue;
            if ("imageDataReduced".equals(f.getName()) || "imageContentType".equals(f.getName())) continue;
            Object newVal = f.get(colorDetails);
            if (newVal != null) {
                f.set(existingColor, newVal);
            }
        }
    } catch (IllegalAccessException e) {
        throw new RuntimeException("Hiba a mezők másolásakor", e);
    }

    // kép frissítése
    if (image != null && !image.isEmpty()) {
        String filename = StringUtils.cleanPath(image.getOriginalFilename());
        existingColor.setImageId(filename);
        existingColor.setImageContentType(image.getContentType());
        existingColor.setImageData(image.getBytes());
        existingColor.setImageDataReduced(image.getBytes());
    }

    Color saved = colorService.saveColor(existingColor);
    return ResponseEntity.ok(saved);
}


    /*
    @GetMapping("/download/{colorId}")
public ResponseEntity<byte[]> downloadImage(@PathVariable Long colorId) {
    Color color = colorService.findById(colorId);
    if (color == null || color.getImageData() == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity
            .ok()
            .contentType(MediaType.parseMediaType(color.getImageContentType()))
            .body(color.getImageData());
}

@PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Color> updateColorWithImage(
        @PathVariable Long id,
        @RequestPart("metadata") Color colorDetails,
        @RequestPart(value = "image", required = false) MultipartFile image
) throws IOException {
    // --- ide jön a jogosultság-ellenőrzés és létezés-ellenőrzés ---
    Color existingColor = colorService.findById(id);
if (existingColor == null) {
  return ResponseEntity.notFound().build();
}
    // reflection alapú mezőmásolás (kivéve imageData/imageContentType)
    for (Field f : Color.class.getDeclaredFields()) {
        f.setAccessible(true);
        if ("imageData".equals(f.getName()) || "imageContentType".equals(f.getName())) continue;
        Object newVal = f.get(colorDetails);
        if (newVal != null) {
            f.set(existingColor, newVal);
        }
    }

    if (image != null && !image.isEmpty()) {
        String filename = StringUtils.cleanPath(image.getOriginalFilename());
        existingColor.setImageId(filename);
        existingColor.setImageContentType(image.getContentType());
        existingColor.setImageData(image.getBytes());
    }

    Color saved = colorService.saveColor(existingColor);
    return ResponseEntity.ok(saved);
}
*/
    @GetMapping("/{id}")
    public ResponseEntity<Color> getColorById(@PathVariable Long id) {
        Color color = colorService.findById(id);
        if (color != null) {
            return ResponseEntity.ok(color);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
/*
    @GetMapping
    public ResponseEntity<List<Color>> getAllColors() {
        List<Color> colors = colorService.getAllColors();
        return ResponseEntity.ok(colors);
    }*/

@GetMapping
public ResponseEntity<Page<Color>> getColorsPaged(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
) {
    Pageable pageable = PageRequest.of(page, size);
    Page<Color> colorPage = colorService.getAllColors(pageable);
    return ResponseEntity.ok(colorPage);
}
    

    @PutMapping("/{id}")
    public ResponseEntity<Color> updateColor(@PathVariable Long id, @RequestBody Color colorDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !isAdminOrManager(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        Color colorOptional = colorService.findById(id);

        if (colorOptional != null) {
           Color color = colorOptional;

            try {
                // Get all fields of the User class
                Field[] fields = Color.class.getDeclaredFields();

                // Iterate through the fields
                for (Field field : fields) {
                    field.setAccessible(true); // Set field accessible
                    Object value = field.get(colorDetails); // Get value of the field from colorDetails
                    if (value != null) {
                        field.set(color, value); // Set the field value in updatedUser
                    }
                }
            } catch (IllegalAccessException e) {
                    throw new RuntimeException("An error occurred while updating color details", e);
            }

            return ResponseEntity.ok(colorService.saveColor(color));
      
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColor(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !isAdminOrManager(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        colorService.deleteColor(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/uploadColorWithImage")
    public void uploadColorWithImage() {
        
    }

}
