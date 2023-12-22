export default class UserDTO {
  constructor(user) {
    this.id = user._id;
    this.full_name = `${user.first_name} ${user.last_name}`;
    this.email = user.email;
    this.role = user.role;
    this.documents = user.documents;
    this.status = user.status;
    this.profilePicture = user.profilePicture;
  }
}
