export default class UserEmailDTO {
  constructor(user) {
    this._id = user._id;
    this.full_name = `${user.first_name} ${user.last_name}`;
    this.email = user.email;
    this.role = user.role;
  }
}
