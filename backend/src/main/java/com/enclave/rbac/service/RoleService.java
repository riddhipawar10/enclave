package com.enclave.rbac.service;

import com.enclave.rbac.entity.Role;
import com.enclave.rbac.exception.ResourceNotFoundException;
import com.enclave.rbac.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
    }

    public Role createRole(String name, String description) {
        Role role = new Role(name, description);
        return roleRepository.save(role);
    }

    public Role updateRole(UUID id, String name, String description) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        role.setName(name);
        role.setDescription(description);
        return roleRepository.save(role);
    }

    public void deleteRole(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Role not found with id: " + id);
        }
        roleRepository.deleteById(id);
    }
}