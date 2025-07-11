package asztalos.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.LoginDto;
import asztalos.model.PasswordResetToken;
import asztalos.model.RegisterDto;
import asztalos.model.User;
import asztalos.repository.PasswordResetTokenRepository;
import asztalos.repository.UserRepository;
import asztalos.service.EmailService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/account")
public class AccountController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${security.jwt.secret-key}")
    private String jwtSecretKey;

    @Value("${security.jwt.issuer}")   
    private String jwtIssuer;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepo;

    @Autowired
    private EmailService emailService;

    @PostMapping("/checkToken")
    public ResponseEntity<Object> checkToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecretKey.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String username = claims.getSubject();
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                var response = new HashMap<String, Object>();
                response.put("user", user);
                response.put("claims", claims);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("User not found");
            }
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<Object> profile(Authentication auth) {
        var response = new HashMap<String, Object>();
        response.put("Username", auth.getName());
        response.put("Authorities", auth.getAuthorities());

        Optional<User> userOptional = userRepository.findByUsername(auth.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            response.put("User", user);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("User not found");
        }
    }
    



    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginDto loginDto, BindingResult result) {
        System.out.println("🔒 Login attempt with username: " + loginDto.getUsername());
        if (result.hasErrors()) {
            var errorsList = result.getAllErrors();
            var errorsMap = new HashMap<String, String>();
    
            for (int i = 0; i < errorsList.size(); i++) {
                var error = (FieldError) errorsList.get(i);
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }
    
        try {
            String plainPassword = loginDto.getPassword();
            String hashedPasswordInput = passwordEncoder.encode(plainPassword);
    
            System.out.println("➡️ Megadott jelszó: " + plainPassword);
            System.out.println("🔒 Megadott jelszó titkosítva: " + hashedPasswordInput);
    
            Optional<User> userOptional = userRepository.findByUsername(loginDto.getUsername());
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                String storedHashedPassword = user.getPassword();
    
                System.out.println("📦 Adatbázisban tárolt titkosított jelszó: " + storedHashedPassword);
                System.out.println("📂 (Teszt) Adatbázisban tárolt jelszó titkosítatlanul: " + user.getPassword());
                System.out.println("🔍 Jelszó egyezik? " + passwordEncoder.matches(plainPassword, storedHashedPassword));
    
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(loginDto.getUsername(), plainPassword)
                );
    
                String jwtToken = createJwtToken(user);
                var response = new HashMap<String, Object>();
                response.put("token", jwtToken);
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ Hiba: Felhasználó nem található");
                return ResponseEntity.badRequest().body("User not found");
            }
        } catch (AuthenticationException e) {
            System.out.println("❌ Authentication error: " + e.getMessage());
        }
    
        return ResponseEntity.badRequest().body("Bad username or password");
    }
    
    
    @PostMapping("/register")
    public ResponseEntity<Object> register(
            @Valid @RequestBody RegisterDto registerDto,
            BindingResult result) {

        Map<String,Object> resp = new HashMap<>();

        // 1. DTO validációs hibák
        if (result.hasErrors()) {
            String msg = result.getAllErrors().stream()
                .map(ObjectError::getDefaultMessage)
                .collect(Collectors.joining("; "));
            resp.put("success", false);
            resp.put("message", msg);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(resp);
        }

        // 2. Username ütközés
        if (userRepository.findByUsername(registerDto.getUserName()).isPresent()) {
            resp.put("success", false);
            resp.put("message", "A felhasználónév már foglalt");
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(resp);
        }

        // 3. Email ütközés
        if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
            resp.put("success", false);
            resp.put("message", "Ez az e-mail cím már regisztrálva van");
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(resp);
        }

        // 4. Új user létrehozása
        User user = new User();
        user.setName(registerDto.getName());
        user.setUsername(registerDto.getUserName());
        user.setEmail(registerDto.getEmail());
        user.setAddress(registerDto.getAddress());
        user.setRole(registerDto.getRole());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        userRepository.save(user);

        // 5. JWT token generálása
        String jwtToken = createJwtToken(user);

        // 6. Sikeres válasz
        resp.put("success", true);
        resp.put("message", "Sikeres regisztráció");
        resp.put("token", jwtToken);
        resp.put("user", user);

        return ResponseEntity.ok(resp);
    }

    private String createJwtToken(User user) {
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date expiryDate = Date.from(now.plusSeconds(30 * 24 * 3600)); // 15 perc lejárati idő
    
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("username", user.getUsername());
        claims.put("role", user.getRole());
        claims.put("email", user.getEmail());
    
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuer(jwtIssuer)
                .setIssuedAt(issuedAt)
                .setExpiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(jwtSecretKey.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

@Transactional
@PostMapping("/forgotPassword")
public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> req) {
    String email = req.get("email");
    Optional<User> userOpt = userRepository.findByEmail(email);

    // Mindig ugyanazt válaszoljuk, hogy ne lehessen kitalálni, létezik-e az e-mail
    String genericMsg = "If the e-mail exists, we’ve sent a password-reset link";
    if (userOpt.isEmpty()) {
        return ResponseEntity.ok(genericMsg);
    }

    User user = userOpt.get();

    // 1️⃣ régi token(ek) törlése
    resetTokenRepo.deleteByUser(user);

    // 2️⃣ új token létrehozása és mentése
    String token = UUID.randomUUID().toString();

    PasswordResetToken prt = new PasswordResetToken();
    prt.setToken(token);
    prt.setUser(user);
    prt.setExpiryDate(Instant.now().plus(30, ChronoUnit.MINUTES));

    resetTokenRepo.save(prt);

    // 3️⃣ e-mail küldése
    emailService.sendResetMail(user, token);

    return ResponseEntity.ok(genericMsg);
}




/**
 * Opcionálisan ellenőrizheted a token érvényességét,
 * így a front gyorsan visszajelezhet 404-gyel, ha a link rossz.
 */
@GetMapping("/validateResetToken")
public ResponseEntity<?> validateToken(@RequestParam String token) {
    return resetTokenRepo.findByToken(token)
            .filter(t -> t.getExpiryDate().isAfter(Instant.now()))
            .map(t -> ResponseEntity.ok().build())
            .orElse(ResponseEntity.status(410).build());   // 410 Gone
}

@PostMapping("/resetPassword")
public ResponseEntity<?> resetPassword(
        @RequestBody Map<String,String> req,
        Authentication auth) {

    String token = req.getOrDefault("token", "").trim();
    String newPwd = req.get("newPassword");
    User user;

    if (token.isEmpty()) {
        // ─────────── Authenticated user változtatja a saját jelszavát ───────────
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity
                   .status(HttpStatus.FORBIDDEN)
                   .body(Collections.singletonMap("message", "Not authenticated"));
        }
        user = userRepository.findByUsername(auth.getName())
               .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    } else {
        // ─────────── Email-alapú reset (tokenes flow) ───────────

        // 1) Lekérjük a tokenhez tartozó entitást
        Optional<PasswordResetToken> prtOpt = resetTokenRepo.findByToken(token);

        if (prtOpt.isEmpty()) {
            return ResponseEntity
                   .status(HttpStatus.GONE)
                   .body(Collections.singletonMap("message", "Invalid token"));
        }
        user = prtOpt.get().getUser();

        // 2) Ha a régi jelszó Welcome1 volt, SKIP-eljük a lejárat-ellenőrzést
        boolean wasDefault = passwordEncoder.matches("Welcome1", user.getPassword());
        if (!wasDefault) {
            // ellenőrizzük a lejáratot csak akkor, ha nem Welcome1 volt
            if (prtOpt.get().getExpiryDate().isBefore(Instant.now())) {
                return ResponseEntity
                       .status(HttpStatus.GONE)
                       .body(Collections.singletonMap("message", "Expired token"));
            }
        }
    }

    // ─────────── Most már megvan a user, függetlenül a flow-tól ───────────

    // 3) Új jelszó nem egyezhet a régivel
    if (passwordEncoder.matches(newPwd, user.getPassword())) {
        return ResponseEntity
               .status(HttpStatus.CONFLICT)
               .body(Collections.singletonMap("message", "Az új jelszó nem egyezhet meg a korábbival"));
    }

    // 4) Mentjük az új jelszót
    user.setPassword(passwordEncoder.encode(newPwd));
    userRepository.save(user);

    // 5) Ha tokenes flow volt, töröljük a tokeneket
    if (!token.isEmpty()) {
        resetTokenRepo.deleteByUser(user);
    }

    return ResponseEntity.ok(Collections.singletonMap("message", "Password changed"));
}



}
