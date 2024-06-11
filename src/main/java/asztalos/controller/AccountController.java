package asztalos.controller;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.LoginDto;
import asztalos.model.RegisterDto;
import asztalos.model.User;
import asztalos.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.validation.Valid;

@CrossOrigin
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
            authenticationManager
                    .authenticate(
                            new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));

            Optional<User> userOptional = userRepository.findByUsername(loginDto.getUsername());
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                String jwtToken = createJwtToken(user);

                var response = new HashMap<String, Object>();
                response.put("token", jwtToken);
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("User not found");
            }

        } catch (AuthenticationException e) {
            System.out.println("There was an error");
        }

        return ResponseEntity.badRequest().body("Bad username or password");
    }
    
    @PostMapping("/register")
    public ResponseEntity<Object> register(
        @Valid @RequestBody RegisterDto registerDto,
        BindingResult result) {
        
        if (result.hasErrors()) {
            var errorsList = result.getAllErrors();
            var errorsMap = new HashMap<String, String>();

            for (int i = 0; i < errorsList.size(); i++) {
                var error = (FieldError) errorsList.get(i);
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }
        
        var byCryptEncoder = new BCryptPasswordEncoder();

        User user = new User();
        user.setName(registerDto.getName());
        user.setUsername(registerDto.getUserName());
        user.setEmail(registerDto.getEmail());
        user.setAddress(registerDto.getAddress());
        user.setRole("user");
        user.setPassword(byCryptEncoder.encode(registerDto.getPassword()));

        try {
            var otherUser = userRepository.findByUsername(registerDto.getUserName());
            if (otherUser.isPresent()) {
                return ResponseEntity.badRequest().body("Username is already used");
            }

            otherUser = userRepository.findByEmail(registerDto.getEmail());
            if (otherUser.isPresent()) {
                return ResponseEntity.badRequest().body("Email is already used");
            }

            userRepository.save(user);

            String jwtToken = createJwtToken(user);

            var response = new HashMap<String, Object>();
            response.put("token", jwtToken);
            response.put("user", user);

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            System.out.println("There is an Exception : " + ex.getMessage());
        }

        return ResponseEntity.badRequest().body("Error");
    }

    private String createJwtToken(User user) {
    Instant now = Instant.now();
    Date issuedAt = Date.from(now);
    Date expiryDate = Date.from(now.plusSeconds(30 * 24 * 3600)); // Token expiry time set to 24 hours

    Map<String, Object> claims = new HashMap<>();
    claims.put("role", user.getRole());

    return Jwts.builder()
            .setClaims(claims)
            .setSubject(user.getUsername())
            .setIssuer(jwtIssuer)
            .setIssuedAt(issuedAt)
            .setExpiration(expiryDate)
            .signWith(Keys.hmacShaKeyFor(jwtSecretKey.getBytes()), SignatureAlgorithm.HS256)
            .compact();
}
}
