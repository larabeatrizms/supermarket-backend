import { Inject, Logger } from '@nestjs/common';

import { CreateUserInterface } from '../dtos/create-user.interface';
import { RpcException } from '@nestjs/microservices';
import { ISuccessResponse } from 'src/shared/interfaces/SuccessResponse.interface';
import { UserRepositoryInterface } from '../repositories/user/user.interface.repository';
import { UserAddressRepositoryInterface } from '../repositories/user-address/user-address.interface.repository';

export class CreateUserService {
  private readonly logger = new Logger(CreateUserService.name);

  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('UserAddressRepositoryInterface')
    private readonly userAddressRepository: UserAddressRepositoryInterface,
  ) {}

  async execute(data: CreateUserInterface): Promise<ISuccessResponse | Error> {
    try {
      this.logger.log('Creating a user...');

      const { address, ...userData } = data;

      this.logger.log('Validating fields...');

      const userAlreadyCreated = await this.userRepository.findOneByCondition({
        email: userData.email,
      });

      if (userAlreadyCreated) {
        throw new RpcException('Este e-mail já está cadastrado.');
      }

      const user = await this.userRepository.create(userData);

      this.logger.log(`User created! Email: ${userData.email}`);

      const addressData = {
        user_id: user.id,
        ...address,
      };

      await this.userAddressRepository.create(addressData);

      this.logger.log(`UserAddress created! Address: ${addressData.street}`);

      return {
        success: true,
        message: 'User created!',
      };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new RpcException(error?.message || error);
    }
  }
}
