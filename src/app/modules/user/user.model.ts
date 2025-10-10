import { model, Schema } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { IUser, UserModal } from "./user.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";

const userSchema = new Schema<IUser, UserModal>(
    {
        name: {
            type: String,
            required: false,
        },
        // userName: {
        //     type: String,
        //     required: false,
        //     unique: false,
        //     lowercase: false,
        // },
        appId: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.USER,
            required: false,
        },
        customeRole:{
            type: String,
            required: false,
            default: null,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            lowercase: true,
        },
        contact: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: false,
            select: 0,
            minlength: 8,
        },
        location: {
            type: String,
            required: false,
        },
        profile: {
            type: String,
            default: 'https://res.cloudinary.com/dzo4husae/image/upload/v1733459922/zfyfbvwgfgshmahyvfyk.png',
        },
        verified: {
            type: Boolean,
            default: false,
        },
        status: {
            type:Boolean,
            default: true,
        },
        hasUsedFreeTrial: {
            type: Boolean,
            default: false,
            },
            stripeCustomerId: { type: String, default: null },
        stripeAccountId: { type: String, default: null },

    


        authentication: {
            type: {
                isResetPassword: {
                    type: Boolean,
                    default: false,
                },
                oneTimeCode: {
                    type: Number,
                    default: null,
                },
                expireAt: {
                    type: Date,
                    default: null,
                },
            },
            select: 0
        },
        accountInformation: {
            status: {
              type: Boolean,
                default: false,
            },
            stripeAccountId: {
                type: String,
            },
            externalAccountId: {
                type: String,
            },
            currency: {
                type: String,
            }
        },
        pages: [{ type: String }],
    },
    {
        timestamps: true
    }
)

// Virtual id for JWT
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
    const isExist = await User.findById(id);
    return isExist;
};
  
userSchema.statics.isExistUserByEmail = async (email: string) => {
    const isExist = await User.findOne({ email });
    return isExist;
};
  
//account check
userSchema.statics.isAccountCreated = async (id: string) => {
    const isUserExist:any = await User.findById(id);
    return isUserExist.accountInformation.status;
};
  
//is match password
userSchema.statics.isMatchPassword = async ( password: string, hashPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashPassword);
};
  

// user check 
userSchema.pre('save', async function (next) {
  
  if (this.isModified('email')) {
    const isExist = await User.findOne({ email: this.email, _id: { $ne: this._id } });
    if (isExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
    }
  }


  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
  }

  next();
});

export const User = model<IUser, UserModal>("User", userSchema)