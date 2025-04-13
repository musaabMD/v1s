import supabase from '../supabase-client';
import { TableNames } from '../database.types';

/**
 * Core API functions for interacting with Supabase
 * These generic functions can be used for any table
 */

/**
 * Get all records from a table with optional filters and pagination
 * 
 * @param {string} table - Table name
 * @param {Object} options - Query options
 * @param {Array} options.filters - Array of filter objects [{column, operator, value}]
 * @param {string} options.select - Columns to select
 * @param {Object} options.order - Order object {column, ascending}
 * @param {number} options.limit - Maximum number of records to return
 * @param {number} options.offset - Number of records to skip
 * @param {Object} options.range - Range of records {from, to}
 * @param {Array} options.containedIn - Filter by contained in array {column, values}
 * @param {string} options.textSearch - Full text search {column, query}
 * @param {string} options.foreignTable - Foreign table to join
 * @param {string} options.foreignSelect - Columns to select from foreign table
 * @returns {Promise<{data, error, count}>} - Query result
 */
export const getAll = async (table, options = {}) => {
  const {
    filters = [],
    select = '*',
    order = null,
    limit = null,
    offset = null,
    range = null,
    containedIn = null,
    textSearch = null,
    foreignTable = null,
    foreignSelect = null,
    count = null
  } = options;

  try {
    // Start building the query
    let query = supabase.from(table).select(
      foreignTable ? `${select}, ${foreignTable}(${foreignSelect || '*'})` : select,
      count ? { count: count } : {}
    );

    // Apply filters if any
    filters.forEach(filter => {
      const { column, operator, value } = filter;
      query = query.filter(column, operator, value);
    });

    // Apply containedIn filter
    if (containedIn) {
      const { column, values } = containedIn;
      query = query.in(column, values);
    }

    // Apply text search
    if (textSearch) {
      const { column, query: searchQuery } = textSearch;
      query = query.textSearch(column, searchQuery);
    }

    // Apply ordering if provided
    if (order) {
      const { column, ascending = true } = order;
      query = query.order(column, { ascending });
    }

    // Apply pagination with limit and offset
    if (limit !== null) {
      query = query.limit(limit);
    }

    if (offset !== null) {
      query = query.range(offset, offset + (limit || 9999));
    }

    // Apply range if provided
    if (range) {
      const { from, to } = range;
      query = query.range(from, to);
    }

    // Execute the query
    const { data, error, count: totalCount } = await query;

    return { data, error, count: totalCount };
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error.message);
    return { data: null, error, count: 0 };
  }
};

/**
 * Get a single record by its ID
 * 
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @param {Object} options - Query options
 * @param {string} options.select - Columns to select
 * @param {string} options.foreignTable - Foreign table to join
 * @param {string} options.foreignSelect - Columns to select from foreign table
 * @returns {Promise<{data, error}>} - Query result
 */
export const getById = async (table, id, options = {}) => {
  const { select = '*', foreignTable = null, foreignSelect = null } = options;

  try {
    const query = supabase
      .from(table)
      .select(foreignTable ? `${select}, ${foreignTable}(${foreignSelect || '*'})` : select)
      .eq('id', id)
      .single();

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    console.error(`Error fetching ${table} by ID:`, error.message);
    return { data: null, error };
  }
};

/**
 * Create a new record
 * 
 * @param {string} table - Table name
 * @param {Object} data - Record data
 * @returns {Promise<{data, error}>} - Query result
 */
export const create = async (table, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    return { data: result, error };
  } catch (error) {
    console.error(`Error creating record in ${table}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Update an existing record
 * 
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @param {Object} data - Updated data
 * @returns {Promise<{data, error}>} - Query result
 */
export const update = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    return { data: result, error };
  } catch (error) {
    console.error(`Error updating record in ${table}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Delete a record
 * 
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @returns {Promise<{success, error}>} - Query result
 */
export const remove = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    return { success: !error, error };
  } catch (error) {
    console.error(`Error deleting record from ${table}:`, error.message);
    return { success: false, error };
  }
};

/**
 * Get the raw Supabase query builder for more complex queries
 * 
 * @param {string} table - Table name
 * @returns {Object} - Supabase query builder
 */
export const query = (table) => {
  return supabase.from(table);
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  query
};