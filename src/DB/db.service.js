export const findOne = async ({ model, filter = {}, select = "", populate = [] } = {}) => {
  return await model.findOne(filter).select(select).populate(populate);
};

export const find = async ({ model, filter = {}, select = "", populate = [] } = {}) => {
  return await model.find(filter).select(select).populate(populate);
};

export const findById = async ({ model, id = "", select = "", populate = [] } = {}) => {
  return await model.findById(id).select(select).populate(populate);
};

export const create = async ({ model, data = {}, options = { validateBeforeSave: true } } = {}) => {
  return await model.create(data, options);
};

export const updateOne = async ({ model, data = {}, filter = {}, options = { runValidators: true } } = {}) => {
  return await model.updateOne(filter, data, options);
};
export const findByIdAndUpdate = async ({ model, data = {}, id = "", options = { new: true,runValidators: true } } = {}) => {
  return await model.findByIdAndUpdate(id, data, options);
};
export const findOneAndUpdate = async ({ model, data = {}, filter = {}, options = { new: true,runValidators: true } } = {}) => {
  return await model.findOneAndUpdate(filter, data, options);
};
