/**
 * Service layer for Candidate
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { candidateRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '$lib/api/types';
import type { ApiResponse } from '$lib/api/types';
import { validateCreateCandidate, validateUpdateCandidate, getFieldErrors } from '$lib/api/modules/candidate/domain';
import type { CandidateEntity } from '$lib/api/modules/candidate/domain';

const CACHE_KEY = 'candidates';

export const candidateService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<CandidateEntity[]>> {
    try {
      const allData = await candidateRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Candidate retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch (err) {
      console.error(`[candidateService] Error:`, err);
      return errorResponse('Failed to retrieve Candidate data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<CandidateEntity>> {
    try {
      const item = await candidateRepository.findById(id);
      if (!item) return errorResponse('Candidate not found.', 404);
      return successResponse(item, 'Candidate retrieved successfully.');
    } catch (err) {
      console.error(`[candidateService] Error:`, err);
      return errorResponse('Failed to retrieve Candidate.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<CandidateEntity>> {
    const parsed = validateCreateCandidate(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await candidateRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'Candidate created successfully.', 201);
    } catch (err) {
      console.error(`[candidateService] Error:`, err);
      return errorResponse('Failed to create Candidate.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<CandidateEntity>> {
    const parsed = validateUpdateCandidate(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await candidateRepository.findById(id);
      if (!existing) return errorResponse('Candidate not found.', 404);
      const updated = await candidateRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'Candidate updated successfully.');
    } catch (err) {
      console.error(`[candidateService] Error:`, err);
      return errorResponse('Failed to update Candidate.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await candidateRepository.findById(id);
      if (!existing) return errorResponse('Candidate not found.', 404);
      await candidateRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'Candidate deleted successfully.');
    } catch (err) {
      console.error(`[candidateService] Error:`, err);
      return errorResponse('Failed to delete Candidate.', 500);
    }
  }
};
