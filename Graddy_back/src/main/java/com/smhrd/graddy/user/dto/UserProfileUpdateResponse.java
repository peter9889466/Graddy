package com.smhrd.graddy.user.dto;

import java.util.Map;

public class UserProfileUpdateResponse {
    private String message;
    private Map<String, String> updatedFields;
    
    public UserProfileUpdateResponse() {}
    
    public UserProfileUpdateResponse(String message, Map<String, String> updatedFields) {
        this.message = message;
        this.updatedFields = updatedFields;
    }
    
    // Getters
    public String getMessage() {
        return message;
    }
    
    public Map<String, String> getUpdatedFields() {
        return updatedFields;
    }
    
    // Setters
    public void setMessage(String message) {
        this.message = message;
    }
    
    public void setUpdatedFields(Map<String, String> updatedFields) {
        this.updatedFields = updatedFields;
    }
}
