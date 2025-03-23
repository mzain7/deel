const Profile = require('../src/models/profile');
const Contract = require('../src/models/contract');
const Job = require('../src/models/job');

/* WARNING THIS WILL DROP THE CURRENT DATABASE */
seed();

async function seed() {
  // create tables
  await Profile.sync({ force: true });
  await Contract.sync({ force: true });
  await Job.sync({ force: true });

  const currentDate = new Date().toISOString();

  // Insert data
  await Promise.all([
    Profile.create({ id: 1, firstName: 'Ali', lastName: 'Khan', profession: 'Software Engineer', balance: 1500, type: 'client' }),
    Profile.create({ id: 2, firstName: 'Sara', lastName: 'Ahmed', profession: 'Designer', balance: 500, type: 'client' }),
    Profile.create({ id: 3, firstName: 'Omar', lastName: 'Raza', profession: 'Data Scientist', balance: 800, type: 'client' }),
    Profile.create({ id: 4, firstName: 'Fatima', lastName: 'Sheikh', profession: 'Writer', balance: 300, type: 'client' }),
    Profile.create({ id: 5, firstName: 'Hamza', lastName: 'Iqbal', profession: 'Musician', balance: 100, type: 'contractor' }),
    Profile.create({ id: 6, firstName: 'Zain', lastName: 'Malik', profession: 'Programmer', balance: 2000, type: 'contractor' }),
    Profile.create({ id: 7, firstName: 'Ayesha', lastName: 'Noor', profession: 'AI Researcher', balance: 700, type: 'contractor' }),
    Profile.create({ id: 8, firstName: 'Bilal', lastName: 'Farooq', profession: 'Photographer', balance: 400, type: 'contractor' }),
    
    Contract.create({ id: 1, terms: 'Standard terms apply', status: 'terminated', ClientId: 1, ContractorId: 5 }),
    Contract.create({ id: 2, terms: 'NDA enforced', status: 'in_progress', ClientId: 1, ContractorId: 6 }),
    Contract.create({ id: 3, terms: 'Hourly billing', status: 'in_progress', ClientId: 2, ContractorId: 6 }),
    Contract.create({ id: 4, terms: 'Fixed-price contract', status: 'in_progress', ClientId: 2, ContractorId: 7 }),
    Contract.create({ id: 5, terms: 'Retainer agreement', status: 'new', ClientId: 3, ContractorId: 8 }),
    Contract.create({ id: 6, terms: 'Project-based', status: 'in_progress', ClientId: 3, ContractorId: 7 }),
    Contract.create({ id: 7, terms: 'Ongoing support', status: 'in_progress', ClientId: 4, ContractorId: 7 }),
    Contract.create({ id: 8, terms: 'Maintenance contract', status: 'in_progress', ClientId: 4, ContractorId: 6 }),
    Contract.create({ id: 9, terms: 'Consultation package', status: 'in_progress', ClientId: 4, ContractorId: 8 }),
    
    Job.create({ description: 'Website Development', price: 500, ContractId: 1, paid: true, paymentDate: currentDate }),
    Job.create({ description: 'Logo Design', price: 250, ContractId: 2, paid: true, paymentDate: currentDate }),
    Job.create({ description: 'Data Analysis', price: 600, ContractId: 3, paid: false }),
    Job.create({ description: 'Content Writing', price: 400, ContractId: 4, paid: false }),
    Job.create({ description: 'Music Production', price: 700, ContractId: 5, paid: true, paymentDate: currentDate }),
    Job.create({ description: 'Photo Editing', price: 300, ContractId: 6, paid: true, paymentDate: currentDate }),
    Job.create({ description: 'AI Model Training', price: 900, ContractId: 7, paid: false }),
    Job.create({ description: 'Social Media Management', price: 350, ContractId: 8, paid: true, paymentDate: currentDate }),
    Job.create({ description: 'Video Editing', price: 450, ContractId: 9, paid: true, paymentDate: currentDate }),
  ]);
}
