package com.ecommerce.platform.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "djsieqe9l",
                "api_key", "913955661491229",
                "api_secret", "dcMtNYj2q8sF6Ifu1x4CoRWf6Zg",
                "secure", true
        ));
    }
}
